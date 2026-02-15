import React from 'react';
import { Skeleton } from "@/components/ui/Skeleton";

const SkeletonProductCard = (): React.ReactElement => {
    return (
        <div className="block bg-background-alt rounded-3xl overflow-hidden border border-border/10 h-full flex flex-col">
            {/* Image Container - Matches ProductCard aspect-square and bg-white (dimmed for skeleton) */}
            <div className="aspect-square bg-white/5 relative p-4 flex items-center justify-center">
                <Skeleton className="w-3/4 h-3/4 rounded-xl bg-white/10" />

                {/* Floating Action Button Placeholder */}
                <div className="absolute bottom-4 left-4 right-4 hidden md:block">
                    <Skeleton className="h-10 w-full rounded-full bg-white/10 opacity-0" />
                </div>
            </div>

            {/* Content Container - Matches ProductCard p-3 md:p-4 */}
            <div className="p-3 md:p-4 flex-grow flex flex-col justify-between">
                <div className="flex flex-col items-center gap-2">
                    {/* Title */}
                    <Skeleton className="h-5 w-3/4 bg-white/10 rounded-md" />
                    {/* Subtitle */}
                    <Skeleton className="h-3 w-1/2 bg-white/5 rounded-md" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-4 pt-2">
                    {/* Price */}
                    <Skeleton className="h-6 w-16 bg-white/10 rounded-md" />
                    {/* Button Chip (Desktop) */}
                    <Skeleton className="hidden md:block h-8 w-20 rounded-full bg-white/10" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonProductCard;
