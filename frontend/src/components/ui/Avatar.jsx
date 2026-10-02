import React from 'react';

export const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`rounded-full overflow-hidden bg-[#E8F2EE] text-[#1F5E4B] border border-[#D8E9E2] flex items-center justify-center font-medium select-none ${sizes[size] || sizes.md} ${className}`}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'} ${statusSizes[size] || statusSizes.md}`}
        />
      )}
    </div>
  );
};
