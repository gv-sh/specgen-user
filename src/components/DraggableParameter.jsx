import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import DragIndicator from './DragIndicator';
import { createPortal } from 'react-dom';

const DraggableParameter = ({ id, data, children }) => {
  const [isHovered, setIsHovered] = useState(false);
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

  // Render a drag preview when dragging
  const renderDragPreview = () => {
    if (!isDragging) return null;
    
    return createPortal(
      <div
        className={`
          fixed pointer-events-none
          bg-white
          border-2 border-primary
          shadow-lg
          rounded-md
          p-2
          opacity-90
          z-50
          w-64
          max-w-xs
        `}
        style={{
          left: 0,
          top: 0,
          transform: 'translate(10px, 10px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
            {data.type || 'Parameter'}
          </div>
          <div className="text-sm font-medium truncate">{data.name}</div>
        </div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
            {data.description}
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div 
      ref={setNodeRef} 
      className={`
        relative 
        ${isDragging ? 'opacity-60 scale-[0.97] border-primary/50 bg-primary/10 shadow-inner' : ''} 
        ${isHovered ? 'border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20' : 'border-border hover:border-primary/30'}
        cursor-grab 
        border
        rounded-md 
        transition-all
        duration-200
        p-1.5 
        group
        hover:shadow-md
        active:shadow-inner
        ${!isDragging && 'hover:translate-y-[-2px]'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-md z-10 flex items-center justify-center">
          <div className="text-xs font-medium bg-white px-2 py-1 rounded-full shadow-sm text-primary border border-primary/20">
            Dragging...
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 relative z-20">
        <div 
          {...listeners}
          {...attributes}
          className={`
            cursor-grab 
            p-1
            rounded-md
            ${isHovered ? 'bg-primary/10 text-primary' : 'bg-gray-50'} 
            transition-all
            hover:bg-primary/20
            hover:shadow-sm
            active:shadow-inner
            border border-transparent
            ${isHovered ? 'border-primary/20' : ''}
          `}
          title="Drag to Selected Parameters"
        >
          <DragIndicator active={isDragging || isHovered} />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
      
      {isHovered && !isDragging && (
        <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
          Drag me
        </div>
      )}
      
      {renderDragPreview()}
    </div>
  );
};

export default DraggableParameter;