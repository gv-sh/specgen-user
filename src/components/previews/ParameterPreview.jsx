import React from 'react';
import { Slider } from '../ui/slider';
import { Info, ArrowRight } from 'lucide-react';
import { stringToColor } from '../../utils/colorUtils';

/**
 * ParameterPreview component displays a visual preview of how a parameter
 * affects the generated content
 */
const ParameterPreview = ({ parameter, category }) => {
  // For slider parameters, show a visual preview
  if (parameter.type === 'Slider') {
    const config = parameter.config || {};
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 100;
    const defaultValue = config.default !== undefined ? config.default : (min + max) / 2;
    
    // Generate colors based on the parameter and category name
    const { bgColor } = stringToColor(parameter.name + category);
    const bgColorLight = bgColor.replace('-50', '-100');
    
    // Simple examples based on parameter name (more sophisticated logic would be implemented here)
    const getExamples = () => {
      const lowerName = parameter.name.toLowerCase();
      
      if (lowerName.includes('power') || lowerName.includes('authority')) {
        return {
          low: "Less centralized authority",
          high: "More centralized authority"
        };
      } else if (lowerName.includes('technology')) {
        return {
          low: "Low-tech society",
          high: "Advanced tech society"
        };
      } else if (lowerName.includes('conflict')) {
        return {
          low: "Peaceful, harmonious",
          high: "Frequent conflicts"
        };
      } else if (lowerName.includes('prosperity')) {
        return {
          low: "Resource scarcity",
          high: "Abundant resources"
        };
      } else {
        return {
          low: "Minimal impact",
          high: "Maximum impact"
        };
      }
    };
    
    const examples = getExamples();
    
    return (
      <div className="mt-3 rounded-md border border-border/40 p-2 bg-gray-50/50">
        <div className="flex items-center gap-1 mb-1.5">
          <Info className="h-3 w-3 text-muted-foreground" />
          <h3 className="text-xs font-medium">Parameter Effect</h3>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${bgColorLight} mr-1`}></div>
            <span>{examples.low}</span>
          </div>
          <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground/50" />
          <div className="flex items-center">
            <span>{examples.high}</span>
            <div className={`w-2 h-2 rounded-full ${bgColor} ml-1`}></div>
          </div>
        </div>
        
        <div className="mt-1 mb-1">
          <Slider
            disabled
            min={min}
            max={max}
            value={defaultValue}
            className="pointer-events-none"
          />
        </div>
      </div>
    );
  }
  
  // For dropdown parameters, show a tooltip explaining the choice impact
  if (parameter.type === 'Dropdown' || parameter.type === 'Radio' || parameter.type === 'Radio Buttons') {
    return (
      <div className="mt-3 rounded-md border border-border/40 p-2 bg-gray-50/50">
        <div className="flex items-center gap-1 mb-1.5">
          <Info className="h-3 w-3 text-muted-foreground" />
          <h3 className="text-xs font-medium">Selection Impact</h3>
        </div>
        
        <p className="text-xs text-muted-foreground">
          This selection will influence how the generator handles {parameter.name.toLowerCase()} in your story.
        </p>
      </div>
    );
  }
  
  // For other parameter types, provide a generic message
  return (
    <div className="mt-3 rounded-md border border-border/40 p-2 bg-gray-50/50">
      <div className="flex items-center gap-1 mb-1.5">
        <Info className="h-3 w-3 text-muted-foreground" />
        <h3 className="text-xs font-medium">Parameter Info</h3>
      </div>
      
      <p className="text-xs text-muted-foreground">
        This parameter helps shape the {category?.toLowerCase() || 'story'} aspects of your generated content.
      </p>
    </div>
  );
};

export default ParameterPreview;
