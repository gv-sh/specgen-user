import React, { useState } from 'react';
import { Tooltip } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { ChevronDown, GripVertical } from 'lucide-react';
import { stringToColor } from '../../utils/colorUtils';

/**
 * A clean parameter card with a clear drag handle
 */
const ParameterCard = ({ 
  name, 
  description, 
  children, 
  categoryName, 
  error,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Color utility for category only
  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-700 border-gray-200';
    const { bgColor, textColor, borderColor } = stringToColor(category);
    return `${bgColor} ${textColor} ${borderColor}`;
  };
  
  const categoryColor = getCategoryColor(categoryName);
  
  return (
    <div className={`
      border rounded-md 
      ${error ? 'border-red-200 bg-red-50/70' : 'border-border/60 bg-white'} 
      ${disabled ? 'opacity-60 pointer-events-none' : ''}
    `}>
      <div className="p-2">
        {/* Header Row with Drag Handle */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 w-full">
            {/* Drag Handle with Tooltip */}
            <Tooltip content="Drag to select parameter" side="right">
              <div 
                className="drag-handle cursor-grab active:cursor-grabbing opacity-50 hover:opacity-80 transition-opacity p-0.5"
                role="button"
                aria-label="Drag parameter"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </Tooltip>
            
            {/* Parameter Name and Category */}
            <div className="flex-1 flex items-center justify-between">
              <Tooltip content={name} side="top">
                <h3 className="font-medium text-sm truncate">{name}</h3>
              </Tooltip>
              
              {categoryName && (
                <Badge className={`text-[10px] px-1.5 py-px ${categoryColor}`}>
                  {categoryName}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Description - expandable when it's too long */}
        {description && (
          <div className="relative">
            <div 
              className={`text-xs text-muted-foreground ${
                !isExpanded && description.length > 80 
                  ? 'line-clamp-1' 
                  : ''
              }`}
            >
              {description}
            </div>
            {description.length > 80 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary inline-flex items-center mt-0.5"
              >
                {isExpanded ? 'Read less' : 'Read more'}
                <ChevronDown 
                  className={`h-3 w-3 ml-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
            )}
          </div>
        )}
        
        {/* Parameter Control */}
        <div className="mt-2">
          {children}
        </div>
        
        {/* Error display - only shown when there's an error */}
        {error && (
          <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded-sm border border-red-100 flex items-center gap-1">
            <span className="text-[10px]">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterCard;