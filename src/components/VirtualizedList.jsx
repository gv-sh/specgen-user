import React, { useState, useEffect, useRef } from 'react';
import { throttle } from '../utils/performanceUtils';

/**
 * VirtualizedList component renders only the visible items in a long list
 * for better performance with large datasets
 */
const VirtualizedList = ({
  items,
  itemHeight = 150, // Estimated height of each item
  renderItem,
  className = '',
  overscan = 3, // Number of items to render outside of the visible area
  scrollableParentRef = null // Reference to the scrollable parent element
}) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  const calculateVisibleRange = () => {
    if (!containerRef.current) return;
    
    const scrollParent = scrollableParentRef?.current || containerRef.current.parentElement;
    
    if (!scrollParent) return;
    
    const { top: containerTop } = containerRef.current.getBoundingClientRect();
    const { top: scrollTop, height: viewportHeight } = scrollParent.getBoundingClientRect();
    
    // Calculate the relative position
    const relativeTop = containerTop - scrollTop;
    
    // Calculate visible range
    let startIndex = Math.floor(-relativeTop / itemHeight);
    startIndex = Math.max(0, startIndex - overscan);
    
    let endIndex = Math.ceil((viewportHeight - relativeTop) / itemHeight);
    endIndex = Math.min(items.length, endIndex + overscan);
    
    setVisibleRange({ start: startIndex, end: endIndex });
  };
  
  // Throttled version of calculateVisibleRange to avoid too many recalculations
  const throttledCalculateVisibleRange = throttle(calculateVisibleRange, 100);
  
  useEffect(() => {
    calculateVisibleRange();
    
    const scrollParent = scrollableParentRef?.current || 
                        (containerRef.current && containerRef.current.parentElement);
    
    if (scrollParent) {
      scrollParent.addEventListener('scroll', throttledCalculateVisibleRange);
      window.addEventListener('resize', throttledCalculateVisibleRange);
    }
    
    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener('scroll', throttledCalculateVisibleRange);
        window.removeEventListener('resize', throttledCalculateVisibleRange);
      }
    };
  }, [items.length, itemHeight]);
  
  // When items change (e.g., filtering), recalculate visible range
  useEffect(() => {
    calculateVisibleRange();
  }, [items]);
  
  // Render only the visible items
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        height: `${items.length * itemHeight}px`, // Total height of all items
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: `${visibleRange.start * itemHeight}px`, // Position of the first visible item
          width: '100%'
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={item.id || index}
            style={{ height: itemHeight }}
          >
            {renderItem(item, visibleRange.start + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedList;
