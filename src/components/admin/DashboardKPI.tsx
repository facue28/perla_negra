import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
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
            <Link to="/admin/orders" className="block group">
                <Card className="bg-background-alt border-white/10 group-hover:border-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted group-hover:text-accent transition-colors">
                            Vendite (Mese)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">
                            €{stats?.sales_month?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-text-muted">
                            entrate questo mese
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Link to="/admin/orders" className="block group">
                <Card className="bg-background-alt border-white/10 group-hover:border-blue-400/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted group-hover:text-blue-400 transition-colors">
                            Ordini (Mese)
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">
                            {stats?.orders_month || 0}
                        </div>
                        <p className="text-xs text-text-muted">
                            ordini effettuati
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Link to="/admin/products" className="block group">
                <Card className="bg-background-alt border-white/10 group-hover:border-green-400/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted group-hover:text-green-400 transition-colors">
                            Prodotti Attivi
                        </CardTitle>
                        <Package className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">
                            {stats?.total_products || 0}
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link to="/admin/products?filter=low_stock" className="block group">
                <Card className="bg-background-alt border-white/10 group-hover:border-red-400/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted group-hover:text-red-400 transition-colors">
                            Scorte Basse
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">
                            {stats?.low_stock || 0}
                        </div>
                        <p className="text-xs text-text-muted">
                            prodotti {"<"} 5 unità
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
