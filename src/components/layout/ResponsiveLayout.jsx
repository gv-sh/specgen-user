import React from 'react';
import { useScreenSize } from '../../utils/responsiveUtils';

const ResponsiveLayout = ({ children, style = {}, className = '' }) => {
  const { isMobile, isTablet } = useScreenSize();
  
  // Use inline styles for precise control over grid
  let gridStyles = {
    ...style,
    display: 'grid',
    gap: isMobile ? '0.5rem' : isTablet ? '0.75rem' : '1rem',
    width: '100%',
    height: '100%',
    gridAutoRows: 'minmax(0, 1fr)',
    gridTemplateColumns: isMobile 
      ? '1fr' 
      : isTablet 
        ? 'repeat(2, 1fr)' 
        : 'repeat(16, minmax(0, 1fr))'
  };
  
  return (
    <div 
      className={`w-full h-full ${className}`}
      style={gridStyles}
    >
      {children}
    </div>
  );
};

export const Column = ({ 
  children, 
  span = 3,
  className = '',
  mobileOrder,
  tabletSpan,
  desktopSpan
}) => {
  const { isMobile, isTablet } = useScreenSize();
  
  // Use inline styles for precise control
  let columnStyles = {
    gridColumn: isMobile 
      ? 'span 1' 
      : isTablet 
        ? `span ${tabletSpan || 1}` 
        : `span ${desktopSpan || span}`,
    order: isMobile && mobileOrder !== undefined ? mobileOrder : 'initial'
  };
  
  return (
    <div style={columnStyles} className={`p-3 ${className}`}>
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout;