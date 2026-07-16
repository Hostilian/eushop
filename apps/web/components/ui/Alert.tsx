import React from 'react';

type AlertVariant = 'default' | 'warning' | 'destructive' | 'success';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-blue-200 bg-blue-50 text-blue-950',
  warning: 'border-amber-300 bg-amber-50 text-amber-950',
  destructive: 'border-red-300 bg-red-50 text-red-950',
  success: 'border-green-300 bg-green-50 text-green-950',
};

const AlertRoot = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      role={variant === 'destructive' ? 'alert' : 'status'}
      className={[
        'rounded-xl border p-4 text-sm',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
);

AlertRoot.displayName = 'Alert';

function AlertHeading({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={['mb-1 font-semibold', className].join(' ')} {...props} />;
}

export const Alert = Object.assign(AlertRoot, { Heading: AlertHeading });
