import React, { useState } from 'react';
import { Tooltip } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { Info } from 'lucide-react';
import { stringToColor, getTypeColor } from '../../utils/colorUtils';

/**
 * A minimal parameter card with no guidance handles
 */
const ParameterCard = ({ 
  name, 
  type, 
  description, 
  children, 
  categoryName, 
  error,
  showBadges = true,
  parameter,
  disabled = false
}) => {
  // Color utilities
  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-700 border-gray-200';
    const { bgColor, textColor, borderColor } = stringToColor(category);
    return `${bgColor} ${textColor} ${borderColor}`;
  };
  
  const typeColor = getTypeColor(type);
  const categoryColor = getCategoryColor(categoryName);
  
  return (
    <div className={`
      border rounded-md 
      ${error ? 'border-red-200 bg-red-50/70' : 'border-border/60 bg-white'} 
      ${disabled ? 'opacity-60 pointer-events-none' : ''}
    `}>
      <div className="p-2">
        {/* Header Row - combines name, description and badges in a single row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <Tooltip content={name} side="top">
              <h3 className="font-medium text-xs truncate">{name}</h3>
            </Tooltip>
            {description && (
              <Tooltip content={description}>
                <p className="text-[10px] text-muted-foreground truncate">
                  {description}
                </p>
              </Tooltip>
            )}
          </div>
          
          {/* Type and Category Badges */}
          {showBadges && (
            <div className="flex gap-1 flex-nowrap">
              {categoryName && (
                <Badge className={`text-[9px] px-1.5 py-px h-4 ${categoryColor}`}>
                  {categoryName}
                </Badge>
              )}
              {type && (
                <Badge className={`text-[9px] px-1.5 py-px h-4 ${typeColor}`}>
                  {type}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Parameter Control - the actual input component */}
        <div>
          {children}
        </div>
        
        {/* Error display - only shown when there's an error */}
        {error && (
          <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded-sm border border-red-100 flex items-center gap-1">
            <Info size={12} className="flex-shrink-0" />
            <span className="text-[10px]">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterCard;