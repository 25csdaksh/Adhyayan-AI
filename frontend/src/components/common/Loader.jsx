import React from 'react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`}
      />
      {text && <p className="text-xs text-slate-400 font-medium">{text}</p>}
    </div>
  );
};
