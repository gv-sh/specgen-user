import React, { useState } from 'react';
import { Tooltip } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { stringToColor, getTypeColor } from '../../utils/colorUtils';
import ParameterPreview from '../previews/ParameterPreview';
import ParameterRelationships from '../previews/ParameterRelationships';
import ParameterGuide from '../previews/ParameterGuide';
import ParameterExamples from '../previews/ParameterExamples';
import HelpTooltip from '../ui/helpTooltip';

/**
 * A unified card component for all parameter types
 * 
 * @param {Object} props
 * @param {string} props.name - Parameter name
 * @param {string} props.type - Parameter type (Slider, Dropdown, etc.)
 * @param {string} props.description - Parameter description
 * @param {React.ReactNode} props.children - Parameter input component
 * @param {string} props.categoryName - Category name for color-coding
 * @param {string} props.error - Error message if any
 * @param {boolean} props.showGuides - Whether to show parameter guides
 * @param {Array} props.allParameters - All parameters for relationship detection
 */
const ParameterCard = ({ 
  name, 
  type, 
  description, 
  children, 
  categoryName, 
  error,
  showBadges = true,
  showGuides = false,
  allParameters = [],
  parameter
 }) => {
  // State for expanded/collapsed view
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a color based on the category name
  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    const { bgColor, textColor, borderColor } = stringToColor(category);
    return `${bgColor} ${textColor} ${borderColor}`;
  };
  
  // Get type color
  const getTypeColorClasses = (type) => {
    return getTypeColor(type);
  };

  const categoryColor = getCategoryColor(categoryName);
  const typeColor = getTypeColorClasses(type);
  
  return (
    <div className={`
      rounded-md 
      border border-border/60
      ${error ? 'bg-red-50' : 'bg-white'} 
      p-2.5
      transition-all
      duration-200
      hover:shadow-sm
      hover:border-primary/40
      group
      relative
    `}>
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-start gap-1">
            <Tooltip content={name}>
              <h3 className="font-medium text-sm mr-auto line-clamp-1">{name}</h3>
            </Tooltip>
            {showGuides && (
              <div className="mt-0.5">
                <HelpTooltip 
                  content={`This parameter affects how ${name.toLowerCase()} is handled in your story.`}
                  title={name}
                />
              </div>
            )}
          </div>
          
          {showBadges && (
            <div className="flex gap-1 flex-wrap justify-end">
              {categoryName && (
                <Badge className={`text-[10px] px-1.5 py-0 h-4 ${categoryColor}`}>
                  {categoryName}
                </Badge>
              )}
              {type && (
                <Badge className={`text-[10px] px-1.5 py-0 h-4 ${typeColor}`}>
                  {type}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {description && (
          <Tooltip content={description}>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-full overflow-hidden text-ellipsis">
              {description}
            </p>
          </Tooltip>
        )}
      </div>
      
      {/* Parameter Control */}
      <div className="mt-2">
        {children}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-1.5 rounded-sm border border-red-100">
          {error}
        </div>
      )}
      
      {/* Advanced Guides and Previews - only shown when showGuides is true */}
      {showGuides && parameter && (
        <>
          {!isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="mt-2 w-full flex items-center justify-center text-xs text-muted-foreground p-1 rounded-sm border border-border/30 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="mr-1">Show parameter guidance</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          )}
          
          {isExpanded && (
            <div className="mt-2 pt-1 animate-in fade-in slide-in-from-top-3 duration-300 ease-in-out">
              <div className="flex justify-end mb-1">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center text-xs text-muted-foreground"
                >
                  <span className="mr-1">Hide guidance</span>
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
              
              <ParameterPreview parameter={parameter} category={categoryName} />
              <ParameterExamples parameter={parameter} categoryName={categoryName} />
              <ParameterGuide parameter={parameter} />
              {allParameters.length > 0 && (
                <ParameterRelationships parameter={parameter} allParameters={allParameters} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParameterCard;
