import React, { HTMLAttributes } from 'react';

/**
 * Skeleton Component
 * Renders a pulsing placeholder to mimic content while loading.
 */
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> { }

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-white/10 ${className || ''}`}
            {...props}
        />
    );
}

export { Skeleton };
