import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#1F5E4B] text-white hover:bg-[#174638] shadow-sm shadow-[#1F5E4B]/15 border border-[#1F5E4B]',
    secondary: 'bg-[#E8F2EE] text-[#1F5E4B] hover:bg-[#D8E9E2] border border-[#D8E9E2] font-semibold',
    outline: 'bg-white text-[#17211D] hover:bg-[#F2F5F3] border border-[#E2E7E3] hover:border-[#BAC5C0] shadow-2xs',
    ghost: 'bg-transparent text-[#17211D] hover:bg-[#F2F5F3] hover:text-[#1F5E4B]',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200',
    accent: 'bg-[#D6A84F] text-[#17211D] hover:bg-[#C99A40] font-semibold shadow-xs',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
    icon: 'p-2 text-sm',
    iconSm: 'p-1.5 text-xs',
  };

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon;
      return <IconComponent className="w-4 h-4 shrink-0" />;
    }
    return null;
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        renderIcon(LeftIcon)
      )}
      {children}
      {!isLoading && renderIcon(RightIcon)}
    </button>
  );
};
