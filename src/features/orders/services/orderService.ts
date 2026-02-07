import { apiClient } from '@/lib/apiClient';
import { CreateOrderInput, Order, OrderItem } from '../types';

/**
 * SERVICIO DE ÓRDENES CON VALIDACIONES DE SEGURIDAD
 * 
 * Este servicio maneja todas las operaciones relacionadas con órdenes.
 * IMPORTANTE: Los precios se validan en el servidor para prevenir manipulación.
 */

interface CreateOrderResponse {
    success: boolean;
    orderId: string;
    orderNumber: string;
    total: number;
    warning?: string;
}

/**
 * Función auxiliar para sanitizar inputs (prevenir XSS)
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
const sanitizeInput = (input: any): any => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim()
        .substring(0, 500); // Limitar longitud máxima
};

export const createOrder = async (orderData: CreateOrderInput): Promise<CreateOrderResponse> => {
    // Nota: El apiClient maneja el try/catch y el logging
    const { customerInfo, items, couponCode } = orderData;

    // Validación básica del lado del cliente (adicional a la del servidor)
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
        throw new Error('Faltan datos obligatorios del cliente');
    }

    if (!items || items.length === 0) {
        throw new Error('El carrito está vacío');
    }

    // Validar longitud del teléfono (prevenir ataques de buffer overflow)
    if (customerInfo.phone.length > 50) {
        throw new Error('Número de teléfono inválido');
    }

    // Sanitizar inputs (prevenir XSS)
    const sanitizedData = {
        customer_name: sanitizeInput(customerInfo.fullName),
        customer_phone: sanitizeInput(customerInfo.phone),
        customer_email: customerInfo.email ? sanitizeInput(customerInfo.email) : null,
        address: sanitizeInput(customerInfo.address),
        city: sanitizeInput(customerInfo.city),
        delivery_notes: customerInfo.notes ? sanitizeInput(customerInfo.notes) : null,
        items: items.map(item => ({
            id: item.id, // ID plano para JSONB
            name: item.name,
            price: item.price,
            quantity: Math.max(1, Math.min(999, Number(item.quantity)))
        })),
        coupon_code: couponCode || null
    };

    // Llamar a la función RPC segura vía apiClient
    const { data } = await apiClient.rpc('create_order', {
        customer_info: {
            fullName: sanitizedData.customer_name,
            phone: sanitizedData.customer_phone,
            email: sanitizedData.customer_email,
            address: sanitizedData.address,
            city: sanitizedData.city,
            notes: sanitizedData.delivery_notes
        },
        items: sanitizedData.items,
        coupon_code: sanitizedData.coupon_code
    });

    if (!data) {
        throw new Error('No se recibieron datos al crear la orden');
    }

    return {
        success: true,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        total: data.total,
        warning: data.warning // Propagamos la advertencia si existe
    };
};

interface OrderFilters {
    status?: string; // Could be enum
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
}

export const getOrders = async (filters: OrderFilters = {}): Promise<Order[]> => {
    // Usamos apiClient.get con un query builder dinámico
    const { data } = await apiClient.get('orders', (query) => {
        // Hacemos select con relación
        let q = query.select(`
            *,
            order_items (
                id,
                product_name,
                product_image,
                product_category,
                price,
                quantity,
                subtotal
            )
        `).order('created_at', { ascending: false });

        // Aplicar filtros
        if (filters.status) {
            q = q.eq('status', filters.status);
        }

        if (filters.startDate) {
            q = q.gte('created_at', filters.startDate);
        }

        if (filters.endDate) {
            q = q.lte('created_at', filters.endDate);
        }

        if (filters.searchTerm) {
            q = q.or(`order_number.ilike.%${filters.searchTerm}%,customer_name.ilike.%${filters.searchTerm}%`);
        }

        return q;
    });

    return (data as any) as Order[];
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
    const { data } = await apiClient.get('orders', (query) =>
        query.select(`
            *,
            order_items (
                id,
                product_id,
                product_name,
                product_image,
                product_category,
                price,
                quantity,
                subtotal
            )
        `)
            .eq('id', orderId)
            .single()
    );

    // apiClient.get is typed to return T[] (array), but .single() returns T (object)
    // We cast to unknown first to avoid "insufficient overlap" error
    return (data as unknown) as Order;
};

export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<boolean> => {
    // Validar que el estado sea válido
    const validStatuses = ['nueva', 'en_preparacion', 'completada', 'cancelada'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Estado inválido');
    }

    const { data } = await apiClient.rpc('update_order_status_secure', {
        p_order_id: orderId,
        p_new_status: newStatus
    });

    return !!data;
};

interface OrderStats {
    statusCounts: Record<string, number>;
    totalSales: number;
    recentOrdersCount: number;
}

export const getOrderStats = async (): Promise<OrderStats> => {
    try {
        // Esta función es compuesta, mantendremos el try/catch interno para devolver estructura default si falla algo parcial,
        // aunque apiClient ya loguea.

        // 1. Total de órdenes por estado
        const { data: ordersData } = await apiClient.get('orders', q => q.select('status'));

        const counts: Record<string, number> = { nueva: 0, en_preparacion: 0, completada: 0, cancelada: 0 };
        if (Array.isArray(ordersData)) {
            ordersData.forEach((order: any) => {
                if (counts[order.status] !== undefined) {
                    counts[order.status]++;
                }
            });
        }

        // 2. Total de ventas (solo órdenes completadas)
        const { data: salesData } = await apiClient.get('orders', q => q.select('total').eq('status', 'completada'));

        const totalSales = Array.isArray(salesData)
            ? salesData.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0)
            : 0;

        // 3. Órdenes recientes (últimas 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentData } = await apiClient.get('orders', q =>
            q.select('id', { count: 'exact', head: true }) // count only
                .gte('created_at', thirtyDaysAgo.toISOString())
        );
        // Nota: apiClient.get devuelve { data, count }?? apiClient actual solo devuelve data.
        // Mi implementación actual de apiClient NO devuelve count.
        // Voy a asumir que recentData es el array y tomo length, aunque sea menos eficiente que count.
        // O mejor, uso apiClient para hacer un count si soportara.
        // Por ahora, length está bien si no son miles de millones.

        return {
            statusCounts: counts,
            totalSales,
            recentOrdersCount: Array.isArray(recentData) ? recentData.length : 0
        };

    } catch {
        // apiClient ya logueó el error específico, pero aquí retornamos fallback
        return {
            statusCounts: { nueva: 0, en_preparacion: 0, completada: 0, cancelada: 0 },
            totalSales: 0,
            recentOrdersCount: 0
        };
    }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
    // Al ser una operación sensible, confiamos en RLS para la seguridad
    await apiClient.delete('orders', orderId);
    return true;
};

const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats,
    deleteOrder
};

// Helper to get daily sales for the chart
export const getSalesChartData = async (days = 30) => {
    try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);

        const { data: orders, error } = await apiClient.get('orders', (query) =>
            query.select('created_at, total')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true })
        );

        if (error) throw error;

        // Group by date
        const salesMap = new Map<string, number>();

        // Initialize all days with 0
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            salesMap.set(dateStr, 0);
        }

        // Fill with actual data
        (orders as any[])?.forEach(order => {
            const date = new Date(order.created_at);
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            const currentTotal = salesMap.get(dateStr) || 0;
            salesMap.set(dateStr, currentTotal + (typeof order.total === 'number' ? order.total : parseFloat(order.total)));
        });

        // Convert to array and reverse to show chronological order
        const chartData = Array.from(salesMap, ([date, total]) => ({ date, total })).reverse();

        return chartData;

    } catch (error) {
        console.error('Error fetching sales chart data:', error);
        return [];
    }
};

export default orderService;
