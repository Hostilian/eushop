import React from 'react';

export function Avatar({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-gray-200',
        className,
      ].join(' ')}
      {...props}
    />
  );
}

export function AvatarImage(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [error, setError] = React.useState(false);
  const { alt = '', ...imgProps } = props;

  if (error) {
    return (
      <span
        className="inline-flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
      >
        <svg width="100%" height="100%" viewBox="0 0 1 1" aria-label="Avatar placeholder" role="img" className="block">
          <circle cx="0.5" cy="0.5" r="0.4" fill="currentColor" opacity="0.2" />
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="currentColor" opacity="0.6" font-size="0.2">
            {alt || 'Avatar'}
          </text>
        </svg>
      </span>
    );
  }

  return (
    <img
      alt={alt}
      {...imgProps}
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        setError(true);
      }}
    />
  );
}

export function AvatarFallback({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[
        'flex h-full w-full items-center justify-center font-semibold text-gray-700',
        className,
      ].join(' ')}
      {...props}
    />
  );
}