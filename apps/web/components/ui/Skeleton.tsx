
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

/**
 * Loading skeleton placeholder. Used to prevent Cumulative Layout Shift (CLS)
 * while data is fetching. Always provide a descriptive aria-label.
 */
export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const shapeClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded'
      : 'rounded-xl';

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={[
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        shapeClass,
        className,
      ].join(' ')}
    />
  );
}

/**
 * Pre-built skeleton layout matching the ProductCard dimensions.
 * Drop this in wherever a ProductCard will load to prevent layout shift.
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" variant="text" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" variant="text" />
        <Skeleton className="h-3 w-full" variant="text" />
        <Skeleton className="h-3 w-2/3" variant="text" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-7 w-20" variant="text" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

