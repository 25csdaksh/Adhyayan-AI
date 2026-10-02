import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div className={`inline-flex p-1 bg-[#F2F5F3] border border-[#E2E7E3] rounded-xl gap-1 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none
                ${isActive
                  ? 'bg-white text-[#1F5E4B] shadow-2xs font-semibold'
                  : 'text-[#6B756F] hover:text-[#17211D] hover:bg-white/50'}`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F5E4B]' : 'text-[#6B756F]'}`} />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#E8F2EE] text-[#1F5E4B]' : 'bg-[#E2E7E3] text-[#6B756F]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-[#E2E7E3] flex items-center gap-4 sm:gap-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 py-3 border-b-2 text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none
              ${isActive
                ? 'border-[#1F5E4B] text-[#1F5E4B] font-semibold'
                : 'border-transparent text-[#6B756F] hover:text-[#17211D] hover:border-[#BAC5C0]'}`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F5E4B]' : 'text-[#6B756F]'}`} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#E8F2EE] text-[#1F5E4B]' : 'bg-[#F2F5F3] text-[#6B756F]'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
