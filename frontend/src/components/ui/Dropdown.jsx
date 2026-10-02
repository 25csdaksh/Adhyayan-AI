import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignStyles = {
    right: 'right-0 origin-top-right',
    left: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignStyles[align] || alignStyles.right} mt-2 w-56 rounded-xl bg-white border border-[#E2E7E3] shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 focus:outline-none ${className}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  danger = false,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${danger ? 'text-rose-700 hover:bg-rose-50' : 'text-[#17211D] hover:bg-[#F2F5F3] hover:text-[#1F5E4B]'}
        ${className}`}
    >
      {Icon && <Icon className={`w-4 h-4 shrink-0 ${danger ? 'text-rose-500' : 'text-[#6B756F]'}`} />}
      {children}
    </button>
  );
};

export const DropdownDivider = () => (
  <div className="my-1 border-t border-[#EDF1EE]" />
);
