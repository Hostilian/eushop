import React from 'react';

interface V77BadgeProps {
  children: React.ReactNode;
  variant?: 'cobalt' | 'saffron' | 'terracotta' | 'herb' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const V77Badge: React.FC<V77BadgeProps> = ({
  children,
  variant = 'cobalt',
  size = 'sm',
  className = '',
}) => {
  let style = '';
  switch (variant) {
    case 'cobalt':
      style = 'bg-[#1845d4]/10 text-[#1845d4] border-[#1845d4]/20';
      break;
    case 'saffron':
      style = 'bg-[#e5a024]/15 text-[#8f610e] border-[#e5a024]/30';
      break;
    case 'terracotta':
      style = 'bg-[#c84e38]/10 text-[#c84e38] border-[#c84e38]/20';
      break;
    case 'herb':
      style = 'bg-[#365e38]/10 text-[#365e38] border-[#365e38]/20';
      break;
    case 'neutral':
      style = 'bg-[#efece4] text-[#141613] border-[#dcd7cb]';
      break;
    case 'outline':
      style = 'bg-transparent text-[#65675f] border-[#dcd7cb]';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-md border ${padding} ${style} ${className}`}>
      {children}
    </span>
  );
};
