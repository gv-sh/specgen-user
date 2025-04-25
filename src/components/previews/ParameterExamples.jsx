import React, { useState } from 'react';
import { Lightbulb, ChevronRight, ChevronDown } from 'lucide-react';

/**
 * ParameterExamples component shows examples of how the parameter affects output
 * 
 * @param {Object} props
 * @param {Object} props.parameter - The parameter to provide examples for
 * @param {string} props.categoryName - The category name
 */
const ParameterExamples = ({ parameter, categoryName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Generate simple examples based on parameter type and name
  const getExamples = () => {
    const lowerName = parameter.name.toLowerCase();
    const lowerCategory = (categoryName || '').toLowerCase();
    
    // Slider examples showing different values
    if (parameter.type === 'Slider') {
      // Examples for political parameters
      if (lowerCategory === 'politics' || lowerName.includes('power') || lowerName.includes('authorit')) {
        return {
          low: "The council's decisions required approval from multiple representatives, ensuring no single voice held undue influence.",
          mid: "While the president had significant authority, they still needed to work with the legislative branch for major policy changes.",
          high: "The emperor's word was absolute law, with even the slightest dissent treated as treason."
        };
      }
      
      // Examples for economic parameters
      if (lowerCategory === 'economics' || lowerName.includes('resource') || lowerName.includes('wealth')) {
        return {
          low: "Families carefully rationed their limited supplies, trading essential goods through a community barter system.",
          mid: "Most citizens had their basic needs met, though luxury items were still considered special purchases.",
          high: "Resources were so abundant that nobody worried about scarcity, and even the most extravagant desires could be fulfilled."
        };
      }
      
      // Examples for technology parameters
      if (lowerCategory === 'technology' || lowerName.includes('tech') || lowerName.includes('innovation')) {
        return {
          low: "Tools were simple and handcrafted, with knowledge passed through direct apprenticeship.",
          mid: "Digital technology enhanced daily life, though people maintained a healthy balance with traditional methods.",
          high: "Advanced AI systems managed nearly every aspect of society, with neural interfaces connecting humans directly to the global network."
        };
      }
      
      // Default slider examples
      return {
        low: "This parameter has minimal influence on the story at low values.",
        mid: "At medium values, this parameter creates a balanced approach.",
        high: "When set to high values, this parameter strongly shapes the narrative."
      };
    }
    
    // Dropdown or radio button examples
    if (parameter.type === 'Dropdown' || parameter.type === 'Radio' || parameter.type === 'Radio Buttons') {
      if (parameter.values && parameter.values.length > 0) {
        // Get up to 3 options to show as examples
        const exampleOptions = parameter.values.slice(0, 3);
        return exampleOptions.map(option => ({
          option: option.label,
          example: `When "${option.label}" is selected, the ${parameter.name.toLowerCase()} in your story will reflect this choice.`
        }));
      }
    }
    
    // Default example for any parameter
    return [
      {
        option: "General Usage",
        example: `This ${parameter.type.toLowerCase()} affects how ${parameter.name.toLowerCase()} is handled in the generated content.`
      }
    ];
  };
  
  const examples = getExamples();
  
  return (
    <div className="mt-3 rounded-md border border-border/40 p-2 bg-gray-50/50">
      <button 
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1">
          <Lightbulb className="h-3 w-3 text-amber-500" />
          <h3 className="text-xs font-medium">Example Outputs</h3>
        </div>
        {isExpanded ? 
          <ChevronDown className="h-3 w-3 text-muted-foreground" /> : 
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        }
      </button>
      
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/30 animate-in fade-in slide-in-from-top-3 duration-200">
          {parameter.type === 'Slider' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-xs font-medium">Low value:</span>
              </div>
              <p className="text-xs text-muted-foreground pl-3 border-l border-blue-200">{examples.low}</p>
              
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span className="text-xs font-medium">Medium value:</span>
              </div>
              <p className="text-xs text-muted-foreground pl-3 border-l border-purple-200">{examples.mid}</p>
              
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                <span className="text-xs font-medium">High value:</span>
              </div>
              <p className="text-xs text-muted-foreground pl-3 border-l border-red-200">{examples.high}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(examples) && examples.map((example, index) => (
                <div key={index} className="space-y-1">
                  <span className="text-xs font-medium">{example.option}:</span>
                  <p className="text-xs text-muted-foreground">{example.example}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParameterExamples;
