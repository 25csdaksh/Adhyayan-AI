import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E2E7E3] shadow-2xs transition-all duration-200
        ${hoverable ? 'hover:border-[#BAC5C0] hover:shadow-sm cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-5 pb-3 sm:p-6 sm:pb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => (
  <Component className={`text-base sm:text-lg font-bold text-[#17211D] tracking-tight ${className}`} {...props}>
    {children}
  </Component>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs sm:text-sm text-[#6B756F] mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-5 pt-0 sm:p-6 sm:pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-5 pt-3 sm:p-6 sm:pt-3 border-t border-[#EDF1EE] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
