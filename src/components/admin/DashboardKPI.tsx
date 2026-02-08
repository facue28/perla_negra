import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, AlertTriangle } from "lucide-react";
import { DashboardStats } from "@/types/admin";
import { Skeleton } from "@/components/ui/Skeleton";

interface KPIProps {
    stats: DashboardStats | null;
    loading: boolean;
}

export function DashboardKPI({ stats, loading }: KPIProps) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[120px] rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-background-alt border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Ventas (Mes)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        €{stats?.sales_month?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-xs text-text-muted">
                        ingresos este mes
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-background-alt border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Pedidos (Mes)
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        {stats?.orders_month || 0}
                    </div>
                    <p className="text-xs text-text-muted">
                        pedidos realizados
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-background-alt border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Productos Activos
                    </CardTitle>
                    <Package className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        {stats?.total_products || 0}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-background-alt border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Stock Bajo
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        {stats?.low_stock || 0}
                    </div>
                    <p className="text-xs text-text-muted">
                        productos {"<"} 5 unidades
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
