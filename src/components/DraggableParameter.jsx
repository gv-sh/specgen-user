import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import DragIndicator from './DragIndicator';

const DraggableParameter = ({ id, data, children }) => {
  // Ensure we have proper default values for the parameter
  const paramData = {
    ...data,
    value: data.value !== undefined ? data.value : data.defaultValue || null
  };

  console.log('Parameter data for drag:', paramData);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { current: paramData }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`
        relative 
        ${isDragging ? 'opacity-70' : ''} 
        cursor-grab 
        border border-border 
        hover:border-primary/50 
        hover:bg-accent/5 
        rounded-md 
        transition-colors
        p-1 
        group
      `}
    >
      <div className="flex items-center gap-2">
        <div 
          {...listeners}
          {...attributes}
          className="cursor-grab"
        >
          <DragIndicator active={isDragging} />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DraggableParameter;