import React, { useState } from 'react';

export const Tooltip = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-x-2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform translate-x-2 -translate-y-1/2 ml-2',
  };
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className={`
            absolute z-50 px-2 py-1 text-xs rounded shadow-md
            bg-foreground text-background max-w-xs w-max
            whitespace-normal pointer-events-none
            opacity-90 transition-opacity duration-200
            ${positions[position]}
            ${className}
          `}
          role="tooltip"
        >
          {content}
          <div 
            className={`
              absolute w-2 h-2 bg-foreground transform rotate-45
              ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1' : ''}
              ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1' : ''}
              ${position === 'left' ? 'right-0 top-1/2 translate-x-1 -translate-y-1/2' : ''}
              ${position === 'right' ? 'left-0 top-1/2 -translate-x-1 -translate-y-1/2' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};
