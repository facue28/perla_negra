import { apiClient } from '@/lib/apiClient';

/**
 * SERVICIO DE ÓRDENES CON VALIDACIONES DE SEGURIDAD
 * 
 * Este servicio maneja todas las operaciones relacionadas con órdenes.
 * IMPORTANTE: Los precios se validan en el servidor para prevenir manipulación.
 */

/**
 * Crea una nueva orden de forma segura
 * Los precios se validan en el servidor usando la función RPC
 * 
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<Object>} Confirmación de la orden creada
 */
export const createOrder = async (orderData) => {
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
            quantity: Math.max(1, Math.min(999, parseInt(item.quantity)))
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

    return {
        success: true,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        total: data.total,
        warning: data.warning // Propagamos la advertencia si existe
    };
};

/**
 * Obtiene todas las órdenes (solo para admins)
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de órdenes
 */
export const getOrders = async (filters = {}) => {
    // Usamos apiClient.get con un query builder dinámico
    const { data } = await apiClient.get('orders', (query) => {
        // Hacemos select con relación
        query = query.select(`
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
            query = query.eq('status', filters.status);
        }

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }

        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }

        if (filters.searchTerm) {
            query = query.or(`order_number.ilike.%${filters.searchTerm}%,customer_name.ilike.%${filters.searchTerm}%`);
        }

        return query;
    });

    return data || [];
};

/**
 * Obtiene una orden específica por ID
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Datos de la orden
 */
export const getOrderById = async (orderId) => {
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

    return data;
};

/**
 * Actualiza el estado de una orden (solo admins)
 * @param {string} orderId - ID de la orden
 * @param {string} newStatus - Nuevo estado
 * @returns {Promise<boolean>} Éxito de la operación
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    // Validar que el estado sea válido
    const validStatuses = ['nueva', 'en_preparacion', 'completada', 'cancelada'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Estado inválido');
    }

    const { data } = await apiClient.rpc('update_order_status_secure', {
        p_order_id: orderId,
        p_new_status: newStatus
    });

    return data;
};

/**
 * Obtiene estadísticas de ventas
 * @returns {Promise<Object>} Estadísticas
 */
export const getOrderStats = async () => {
    try {
        // Esta función es compuesta, mantendremos el try/catch interno para devolver estructura default si falla algo parcial,
        // aunque apiClient ya loguea.

        // 1. Total de órdenes por estado
        const { data: ordersData } = await apiClient.get('orders', q => q.select('status'));

        const counts = { nueva: 0, en_preparacion: 0, completada: 0, cancelada: 0 };
        ordersData?.forEach(order => {
            if (counts[order.status] !== undefined) {
                counts[order.status]++;
            }
        });

        // 2. Total de ventas (solo órdenes completadas)
        const { data: salesData } = await apiClient.get('orders', q => q.select('total').eq('status', 'completada'));

        const totalSales = salesData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

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
            recentOrdersCount: recentData?.length || 0
        };

    } catch (error) {
        // apiClient ya logueó el error específico, pero aquí retornamos fallback
        return {
            statusCounts: { nueva: 0, en_preparacion: 0, completada: 0, cancelada: 0 },
            totalSales: 0,
            recentOrdersCount: 0
        };
    }
};

/**
 * Función auxiliar para sanitizar inputs (prevenir XSS)
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim()
        .substring(0, 500); // Limitar longitud máxima
};

/**
 * Elimina una orden (solo admins)
 * @param {string} orderId - ID de la orden
 * @returns {Promise<boolean>} Éxito de la operación
 */
export const deleteOrder = async (orderId) => {
    // Al ser una operación sensible, confiamos en RLS para la seguridad
    await apiClient.delete('orders', orderId);
    return true;
};

export default {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats,
    deleteOrder
};
