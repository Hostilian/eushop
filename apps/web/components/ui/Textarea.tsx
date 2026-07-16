import React from 'react';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={[
      'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm',
      'text-gray-900 placeholder:text-gray-400 focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-brand-green',
      className,
    ].join(' ')}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
