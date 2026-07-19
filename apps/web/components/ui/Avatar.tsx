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
  // Ensure alt is present; if not provided, default to empty string for decorative images
  const { alt = '', ...imgProps } = props;
  return <img alt={alt} className="h-full w-full object-cover" {...imgProps} />;
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