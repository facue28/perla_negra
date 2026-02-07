import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesData {
    date: string;
    total: number;
}

interface SalesChartProps {
    data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    return (
        <div className="bg-[#141414]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Resumen de Ventas (30 días)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3FFFC1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3FFFC1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#141414',
                                borderColor: '#333',
                                color: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#3FFFC1' }}
                            formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ventas']}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#3FFFC1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
