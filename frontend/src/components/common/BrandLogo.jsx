import React from 'react';

/**
 * BrandLogo Component
 * Renders the official AdhyayanLM brand logo image with responsive size variants.
 */
export const BrandLogo = ({
  size = 'md',
  className = '',
  alt = 'AdhyayanLM Logo',
  priority = false,
}) => {
  const sizeClasses = {
    xs: 'h-7 sm:h-8 w-auto max-w-[150px]',
    sm: 'h-9 sm:h-10 w-auto max-w-[190px]',
    md: 'h-10 sm:h-11 md:h-12 w-auto max-w-[220px]',
    lg: 'h-13 sm:h-15 w-auto max-w-[280px]',
    xl: 'h-16 sm:h-20 w-auto max-w-[340px]',
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <img
      src="/logo.png"
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={`object-contain transition-transform duration-200 ${selectedSizeClass} ${className}`}
    />
  );
};

export default BrandLogo;
