import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { createPortal } from 'react-dom';

const DraggableParameter = ({ id, data, children }) => {
  // Ensure we have proper default values for the parameter
  const paramData = {
    ...data,
    value: data.value !== undefined ? data.value : data.defaultValue || null
  };
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { current: paramData }
  });

  // Make the entire card draggable directly, no separate handle
  return (
    <div 
      ref={setNodeRef} 
      {...attributes}
      {...listeners}
      className={`
        relative cursor-grab
        ${isDragging ? 'opacity-70' : ''} 
        transition-colors
      `}
    >
      {children}
      
      {/* Only show portal when dragging */}
      {isDragging && createPortal(
        <div
          className="fixed pointer-events-none bg-white border border-primary shadow-md rounded p-1.5 opacity-90 z-50 w-48 max-w-xs"
          style={{
            left: 0,
            top: 0,
            transform: 'translate(10px, 10px)',
          }}
        >
          <div className="flex items-center">
            <span className="text-xs font-medium truncate">{data.name}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DraggableParameter;