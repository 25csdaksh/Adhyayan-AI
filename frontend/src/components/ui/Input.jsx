import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  hint,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#17211D]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-[#6B756F]">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full rounded-xl bg-white border text-sm text-[#17211D] placeholder:text-[#8E9993] transition-all duration-150 py-2.5 px-3.5
            ${LeftIcon ? 'pl-10' : ''}
            ${RightIcon ? 'pr-10' : ''}
            ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#E2E7E3] hover:border-[#BAC5C0] focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B]'}
            disabled:bg-[#F2F5F3] disabled:text-[#8E9993] disabled:cursor-not-allowed
            shadow-2xs ${className}`}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3.5 pointer-events-none text-[#6B756F]">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#6B756F]">{hint}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
