/**
 * Skeleton Component
 * Renders a pulsing placeholder to mimic content while loading.
 */
const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-white/10 ${className || ''}`}
            {...props}
        />
    );
}

export { Skeleton }
