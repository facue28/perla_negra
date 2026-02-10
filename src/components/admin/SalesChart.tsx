import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailySales } from "@/types/admin";
import { Skeleton } from "@/components/ui/Skeleton";

interface ChartProps {
    data: DailySales[];
    loading: boolean;
}

export function SalesChart({ data, loading }: ChartProps) {
    if (loading) {
        return <Skeleton className="h-[350px] w-full rounded-xl" />;
    }

    return (
        <Card className="bg-background-alt border-white/10 col-span-4">
            <CardHeader>
                <CardTitle className="text-text-primary">Tendencia de Ventas (30 Días)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date_label"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ color: '#D4AF37' }}
                            formatter={(value: number) => [`€${value}`, 'Ventas']}
                        />
                        <Area
                            type="monotone"
                            dataKey="total_sales"
                            stroke="#D4AF37"
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
