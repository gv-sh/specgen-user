import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import DragIndicator from './DragIndicator';
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

  // Render a drag preview when dragging
  const renderDragPreview = () => {
    if (!isDragging) return null;
    
    return createPortal(
      <div
        className="fixed pointer-events-none bg-white border border-primary shadow-md rounded p-1.5 opacity-90 z-50 w-56 max-w-xs"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(10px, 10px)',
        }}
      >
        <div className="flex items-center gap-1">
          <div className="text-[9px] font-medium bg-primary/10 text-primary px-1 py-px rounded-sm">
            {data.type || 'Parameter'}
          </div>
          <div className="text-xs font-medium truncate">{data.name}</div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div 
      ref={setNodeRef} 
      className={`
        relative border rounded-md
        ${isDragging ? 'opacity-70' : ''} 
        transition-colors
      `}
    >
      <div className="flex items-center">
        <div 
          {...listeners}
          {...attributes}
          className="cursor-grab text-gray-400 hover:text-gray-600 flex items-center justify-center w-6"
          title="Drag to add"
        >
          <DragIndicator active={isDragging} />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
      
      {renderDragPreview()}
    </div>
  );
};

export default DraggableParameter;