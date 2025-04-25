import React, { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { X, ArrowDown } from 'lucide-react';
import { Tooltip } from '../components/ui/tooltip';

const DraggedParameters = ({ parameters, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-area'
  });
  
  // Ensure we display parameters correctly, with proper debug info
  useEffect(() => {
    if (parameters && parameters.length > 0) {
      console.log('Parameters in DraggedParameters (detailed):', 
        parameters.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          valueType: typeof p.value,
          valuePresent: p.value !== undefined && p.value !== null,
          value: p.value
        })));
    }
  }, [parameters]);
  
  if (!parameters || parameters.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Selected Parameters</h2>
        <div 
          ref={setNodeRef}
          className={`
            p-3 border border-dashed rounded-lg 
            flex flex-col items-center justify-center 
            min-h-20 transition-colors
            ${isOver ? 'border-primary bg-accent/20' : 'border-border bg-gray-50'}
          `}
        >
          <div className="text-center">
            <p className="text-xs text-foreground/70">
              {isOver ? 'Drop here' : 'Drag parameters here'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Make sure this div is always a droppable target
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center justify-between">
        <span>Selected Parameters</span>
        <span className="text-xs font-medium bg-gray-100 border border-border text-foreground px-1.5 py-0.5 rounded-md">
          {parameters.length}
        </span>
      </h2>
      <div 
        ref={setNodeRef}
        className={`
          border border-dashed rounded-lg p-2 
          min-h-20 transition-colors
          ${isOver ? 'border-primary bg-accent/20' : 'border-border'}
          relative
        `}
      >
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg z-10">
            <div className="bg-white border border-primary rounded-lg px-2 py-1 text-foreground text-xs font-medium">
              Drop here
            </div>
          </div>
        )}
        <div className="space-y-2 relative">
          {parameters.map((param) => {
            // Skip rendering parameters with missing essential data
            if (!param || !param.id || !param.name) {
              console.error('Invalid parameter detected:', param);
              return null;
            }
            
            return (
              <div 
                key={param.id} 
                className="flex items-center justify-between bg-white p-2 rounded-md border border-border shadow-sm"
              >
              <div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Tooltip content={param.name}>
                    <p className="font-medium text-sm truncate max-w-[120px]">{param.name}</p>
                  </Tooltip>
                  <span className="text-xs px-1 py-0.5 bg-gray-100 text-foreground/80 rounded border border-border">
                    {param.type}
                  </span>
                </div>
                <Tooltip content={param.description}>
                  <p className="text-xs text-foreground/70 mt-1 line-clamp-2 max-w-[180px]">{param.description}</p>
                </Tooltip>
                {(param.value !== undefined && param.value !== null && param.value !== '') && (
                  <Tooltip content={`Value: ${typeof param.value === 'object' ? JSON.stringify(param.value) : param.value.toString()}`}>
                    <div className="mt-1 text-xs bg-gray-100 text-foreground border border-border px-1 py-0.5 rounded inline-block truncate max-w-[150px]">
                      {typeof param.value === 'object' 
                        ? (Array.isArray(param.value) 
                            ? (param.value.length > 0 ? JSON.stringify(param.value).slice(0, 12) + '...' : '[]')
                            : JSON.stringify(param.value).slice(0, 12) + '...') 
                        : param.value.toString().length > 12 
                          ? param.value.toString().slice(0, 12) + '...' 
                          : param.value.toString()}
                    </div>
                  </Tooltip>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Removing parameter with ID:', param.id);
                  onRemove(param.id);
                }}
                className="p-1 rounded-md bg-gray-100 text-foreground hover:bg-gray-200 border border-border"
                title="Remove parameter"
              >
                <X size={12} />
              </button>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DraggedParameters;