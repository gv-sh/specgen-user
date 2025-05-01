// src/components/layout/ResponsiveLayout.jsx
import React from 'react';
import { useScreenSize } from '../../utils/responsiveUtils';
import { cn } from '../../lib/utils';

const ResponsiveLayout = ({ children, className = '' }) => {
  const { isMobile, isTablet } = useScreenSize();
  
  return (
    <div 
      className={cn(
        "grid h-full w-full gap-4", 
        isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-[16rem_16rem_1fr]", // Set fixed column widths
        className
      )}
    >
      {children}
    </div>
  );
};

export const Column = ({ 
  children, 
  className = '',
  mobileOrder,
}) => {
  const { isMobile } = useScreenSize();
  
  return (
    <div 
      className={cn(
        "rounded-md border bg-card text-card-foreground shadow-sm h-full",
        isMobile && mobileOrder !== undefined ? `order-${mobileOrder}` : "",
        className
      )}
    >
      <div className="h-full p-4">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout;