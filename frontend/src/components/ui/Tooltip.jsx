import React, { useState } from 'react';

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId;

  const show = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute ${positions[position] || positions.top} z-50 px-2.5 py-1 text-xs font-medium text-white bg-[#17211D] rounded-lg shadow-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
