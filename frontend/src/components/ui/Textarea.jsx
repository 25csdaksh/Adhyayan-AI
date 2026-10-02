import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  hint,
  error,
  rows = 3,
  className = '',
  id,
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={`w-full rounded-xl bg-white border text-sm text-[#17211D] placeholder:text-[#8E9993] transition-all duration-150 p-3
          ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-[#E2E7E3] hover:border-[#BAC5C0] focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B]'}
          disabled:bg-[#F2F5F3] disabled:text-[#8E9993] disabled:cursor-not-allowed
          shadow-2xs resize-y ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#6B756F]">{hint}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
