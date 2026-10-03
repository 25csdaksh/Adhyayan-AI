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
    xs: 'h-6 w-auto',
    sm: 'h-7 w-auto sm:h-8',
    md: 'h-8 w-auto sm:h-9',
    lg: 'h-10 w-auto sm:h-12',
    xl: 'h-12 w-auto sm:h-16',
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
