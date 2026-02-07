import React from 'react';
import { Skeleton } from "@/components/ui/Skeleton";

const SkeletonProductCard = (): React.ReactElement => {
    return (
        <div className="block bg-background-alt rounded-3xl overflow-hidden border border-border/10 h-full flex flex-col">
            {/* Image Skeleton */}
            <div className="aspect-square bg-neutral-800/30 p-4 relative">
                <Skeleton className="w-full h-full rounded-2xl bg-white/5" />
            </div>

            {/* Content Skeleton */}
            <div className="p-3 md:p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2 flex flex-col items-center">
                    {/* Title */}
                    <Skeleton className="h-5 w-3/4 bg-white/10" />
                    {/* Subtitle */}
                    <Skeleton className="h-3 w-11/12 bg-white/5" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mt-2">
                    {/* Price */}
                    <Skeleton className="h-6 w-16 bg-white/10" />
                    {/* Button */}
                    <Skeleton className="hidden md:block h-8 w-24 rounded-full bg-white/10" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonProductCard;
