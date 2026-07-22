import React, { useEffect } from 'react';

interface DialogRootProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function DialogRoot({ open, onOpenChange, children }: DialogRootProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange?.(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onOpenChange?.(false);
      }}
    >
      {children}
    </div>
  );
}

function DialogContent({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={[
        'max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 text-gray-950 shadow-2xl',
        className,
      ].join(' ')}
      {...props}
    />
  );
}

function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mb-4 space-y-1" {...props} />;
}

function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className="text-lg font-semibold" {...props} />;
}

function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-sm text-gray-600" {...props} />;
}

function DialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mt-6 flex justify-end gap-3" {...props} />;
}

export const Dialog = Object.assign(DialogRoot, {
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
});
