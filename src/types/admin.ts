
export interface DashboardStats {
    orders_month: number;
    sales_month: number;
    low_stock: number;
    total_products: number;
}

export interface DailySales {
    date_label: string;
    total_sales: number;
    order_count: number;
}

export interface AdminLog {
    id: string;
    admin_email: string;
    action: string;
    entity: string;
    details: any;
    created_at: string;
}
