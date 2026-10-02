import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 max-w-md mx-auto flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#E8F2EE] border border-[#D8E9E2] text-[#1F5E4B] flex items-center justify-center mb-4 shadow-2xs">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-[#17211D]">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#6B756F] mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              leftIcon={actionIcon}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
