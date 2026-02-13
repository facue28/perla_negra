export interface Admin {
    id: string;
    email: string;
    role: 'admin' | 'superadmin';
    created_at: string;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: AdminOrder[];
    revenueByDay: { date: string; amount: number }[];
}

export interface AdminCoupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed' | 'percent';
    discount_value: number;
    is_active: boolean;
    expiration_date: string | null;
    usage_limit: number | null;
    usage_count: number;
    min_purchase_amount: number | null;
    created_at: string;
}

export type OrderStatus = 'nueva' | 'en_preparacion' | 'completada' | 'cancelada';

export interface AdminOrderItem {
    id?: string;
    product_name: string;
    product_image: string | null;
    price: number | string;
    quantity: number;
    subtotal: number | string;
}

export interface AdminOrder {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    address?: string; // Legacy/Mapping support
    city?: string;
    delivery_notes?: string | null;
    status: OrderStatus;
    subtotal: number | string;
    discount_amount: number | string;
    total: number | string;
    coupon_code?: string | null;
    created_at: string;
    order_items?: AdminOrderItem[];
}

