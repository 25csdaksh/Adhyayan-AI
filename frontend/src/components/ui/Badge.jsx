import React from 'react';

export const Badge = ({
  children,
  variant = 'forest',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    forest: 'bg-[#E8F2EE] text-[#1F5E4B] border-[#D8E9E2]',
    accent: 'bg-[#FAF4E8] text-[#8A671D] border-[#F2E4C2]',
    neutral: 'bg-[#F2F5F3] text-[#4A5550] border-[#E2E7E3]',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  const dotColors = {
    forest: 'bg-[#1F5E4B]',
    accent: 'bg-[#D6A84F]',
    neutral: 'bg-[#6B756F]',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-sky-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.forest} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.forest}`} />
      )}
      {children}
    </span>
  );
};
