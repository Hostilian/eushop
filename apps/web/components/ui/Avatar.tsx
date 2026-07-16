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
  return <img className="h-full w-full object-cover" {...props} />;
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
