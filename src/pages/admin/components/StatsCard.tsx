import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    color: 'blue' | 'green' | 'purple' | 'pink';
}

const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141414]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color]} group-hover:bg-opacity-20 transition-colors`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend.value >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
                        <span className="opacity-70">{trend.label}</span>
                    </div>
                )}
            </div>

            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-text-muted text-sm font-medium">{title}</p>
        </motion.div>
    );
};

export default StatsCard;
