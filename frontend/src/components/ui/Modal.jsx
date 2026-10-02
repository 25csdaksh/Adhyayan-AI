import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17211D]/40 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-white rounded-2xl border border-[#E2E7E3] shadow-xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 my-8 ${className}`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-5 border-b border-[#EDF1EE] flex items-start justify-between gap-4">
            <div>
              {title && <h2 className="text-lg font-bold text-[#17211D]">{title}</h2>}
              {description && <p className="text-xs sm:text-sm text-[#6B756F] mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1 text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[#FAFBF9] border-t border-[#EDF1EE] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
