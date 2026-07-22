import React from 'react';

interface V77ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cobalt' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const V77Button: React.FC<V77ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold transition-all duration-150 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-[#141613] text-[#fffdf8] hover:bg-[#252823] shadow-md focus-visible:ring-[#141613]';
      break;
    case 'cobalt':
      variantStyle = 'bg-[#1845d4] text-white hover:bg-[#102f8f] shadow-md focus-visible:ring-[#1845d4]';
      break;
    case 'secondary':
      variantStyle = 'bg-[#e5a024] text-[#141613] hover:bg-[#c98b1c] shadow-sm focus-visible:ring-[#e5a024]';
      break;
    case 'outline':
      variantStyle = 'border-2 border-[#dcd7cb] text-[#141613] hover:bg-[#efece4] bg-transparent focus-visible:ring-[#141613]';
      break;
    case 'ghost':
      variantStyle = 'text-[#141613] hover:bg-[#efece4] bg-transparent focus-visible:ring-[#141613]';
      break;
  }

  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-3 py-1.5 text-xs';
      break;
    case 'md':
      sizeStyle = 'px-5 py-2.5 text-sm';
      break;
    case 'lg':
      sizeStyle = 'px-7 py-3.5 text-base';
      break;
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};
