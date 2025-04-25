import React, { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

/**
 * ParameterGuide component provides usage tips and examples for parameters
 * 
 * @param {Object} props
 * @param {Object} props.parameter - The parameter to provide guidance for
 */
const ParameterGuide = ({ parameter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Generate usage guidance based on parameter type
  const getUsageGuidance = () => {
    switch (parameter.type) {
      case 'Slider':
        return {
          title: 'How to use this slider',
          tips: [
            'Move the slider toward the right for stronger effect',
            'The middle position often represents a balanced approach',
            'Extreme values can lead to more dramatic results'
          ]
        };
      case 'Dropdown':
        return {
          title: 'Making the right selection',
          tips: [
            'Each option creates a different emphasis in the story',
            'Try different options to see how your story changes',
            'Some options may work better with specific genres'
          ]
        };
      case 'Radio':
      case 'Radio Buttons':
        return {
          title: 'Choosing between options',
          tips: [
            'Each choice represents a distinct approach',
            'Only one option can be active at a time',
            'Consider how this choice interacts with other parameters'
          ]
        };
      case 'Toggle Switch':
        return {
          title: 'Toggle switch usage',
          tips: [
            'Enable to include this feature in your story',
            'Disable to remove or minimize this aspect',
            'Experiment with both states to see the difference'
          ]
        };
      case 'Checkbox':
        return {
          title: 'Working with checkboxes',
          tips: [
            'Select multiple options to combine effects',
            'Each selected option adds to your story',
            'Try different combinations for varied results'
          ]
        };
      default:
        return {
          title: 'Parameter guidance',
          tips: [
            'Adjust this parameter to shape your story',
            'Try different values to see the impact',
            'Consider how this parameter interacts with others'
          ]
        };
    }
  };
  
  // Get guidance based on parameter name
  const getSpecificGuidance = () => {
    const lowerName = parameter.name.toLowerCase();
    
    if (lowerName.includes('central') || lowerName.includes('power')) {
      return "This parameter affects how power is distributed in your story's world.";
    } else if (lowerName.includes('tech') || lowerName.includes('science')) {
      return "This parameter shapes the technological level in your story.";
    } else if (lowerName.includes('conflict') || lowerName.includes('harmony')) {
      return "This parameter influences conflict levels between characters or groups.";
    } else if (lowerName.includes('resource') || lowerName.includes('wealth')) {
      return "This parameter affects resource availability and distribution.";
    }
    
    return null;
  };
  
  const guidance = getUsageGuidance();
  const specificGuidance = getSpecificGuidance();
  
  return (
    <div className="mt-3 rounded-md border border-border/40 p-2 bg-gray-50/50">
      <button 
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-muted-foreground" />
          <h3 className="text-xs font-medium">{guidance.title}</h3>
        </div>
        <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/30">
          {specificGuidance && (
            <p className="text-xs text-muted-foreground mb-1.5">{specificGuidance}</p>
          )}
          
          <ul className="text-xs text-muted-foreground space-y-1.5 pl-3">
            {guidance.tips.map((tip, index) => (
              <li key={index} className="list-disc list-outside">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ParameterGuide;
