import React, { useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

const DraggableParameter = ({ id, data, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);

  const { 
    attributes, 
    listeners, 
    setNodeRef 
  } = useDraggable({
    id,
    data: { current: data }
  });

  // Custom drag start handler to prevent interference
  const handleMouseDown = (e) => {
    // Ignore if clicked on interactive elements
    const interactiveElements = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'];
    if (interactiveElements.includes(e.target.tagName) || 
        e.target.closest('input, select, textarea, button, a')) {
      return;
    }

    // Track initial mouse down position
    dragStartRef.current = { 
      x: e.clientX, 
      y: e.clientY 
    };
  };

  // Custom drag move handler
  const handleMouseMove = (e) => {
    if (!dragStartRef.current) return;

    // Only start dragging if mouse has moved a small threshold
    const threshold = 5; // pixels
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);

    if (dx > threshold || dy > threshold) {
      setIsDragging(true);
      listeners.onMouseDown?.(e);
    }
  };

  // Reset drag state
  const handleMouseUp = () => {
    dragStartRef.current = null;
    setIsDragging(false);
  };

  return (
    <div 
      ref={setNodeRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      {...attributes}
      className={`
        relative 
        ${isDragging ? 'opacity-70 cursor-move' : 'cursor-default'}
        transition-opacity
      `}
    >
      {children}
    </div>
  );
};

export default DraggableParameter;