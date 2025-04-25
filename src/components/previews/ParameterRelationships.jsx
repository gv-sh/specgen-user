import React from 'react';
import { LinkIcon, Ban } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

/**
 * ParameterRelationships component shows how parameters relate to or affect each other
 * 
 * @param {Object} props
 * @param {Object} props.parameter - The current parameter
 * @param {Array} props.allParameters - All available parameters for relationship detection
 */
const ParameterRelationships = ({ parameter, allParameters }) => {
  // Find related parameters based on name or description similarities
  const findRelatedParameters = () => {
    if (!parameter || !allParameters || allParameters.length === 0) {
      return [];
    }
    
    const relatedParams = [];
    const currentParamKeywords = extractKeywords(parameter);
    
    // Don't show relationships if we couldn't extract keywords
    if (currentParamKeywords.length === 0) {
      return [];
    }
    
    // Find parameters with overlapping keywords
    allParameters.forEach(param => {
      // Skip self
      if (param.id === parameter.id) {
        return;
      }
      
      const paramKeywords = extractKeywords(param);
      const overlapCount = countOverlap(currentParamKeywords, paramKeywords);
      
      // Consider related if there's sufficient keyword overlap
      if (overlapCount > 0) {
        relatedParams.push({
          id: param.id,
          name: param.name,
          overlapCount,
          relationshipType: determineRelationshipType(parameter, param)
        });
      }
    });
    
    // Sort by overlap count and take top 3
    return relatedParams
      .sort((a, b) => b.overlapCount - a.overlapCount)
      .slice(0, 3);
  };
  
  // Extract keywords from parameter name and description
  const extractKeywords = (param) => {
    if (!param || !param.name) return [];
    
    // Combine name and description
    let text = param.name.toLowerCase();
    if (param.description) {
      text += ' ' + param.description.toLowerCase();
    }
    
    // Remove common words and split into keywords
    const commonWords = ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'is', 'are', 'be'];
    const words = text.split(/[^a-z0-9]+/);
    return words.filter(word => word.length > 3 && !commonWords.includes(word));
  };
  
  // Count overlapping keywords
  const countOverlap = (keywords1, keywords2) => {
    return keywords1.filter(word => keywords2.includes(word)).length;
  };
  
  // Determine relationship type between parameters
  const determineRelationshipType = (param1, param2) => {
    // This is a simplified example - a real implementation would have more sophisticated logic
    // For example, we might have a predefined map of parameter relationships
    
    // For demonstration purposes:
    if (param1.type === 'Slider' && param2.type === 'Slider') {
      return "These sliders influence related aspects";
    } else if (param1.type === param2.type) {
      return `Related ${param1.type.toLowerCase()} parameters`;
    } else {
      return "These parameters may interact with each other";
    }
  };
  
  const relatedParameters = findRelatedParameters();
  
  if (relatedParameters.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-3 rounded-md border border-border/40 p-2 bg-gray-50/50">
      <div className="flex items-center gap-1 mb-1.5">
        <LinkIcon className="h-3 w-3 text-muted-foreground" />
        <h3 className="text-xs font-medium">Related Parameters</h3>
      </div>
      
      <div className="space-y-1.5">
        {relatedParameters.map(relatedParam => (
          <Tooltip key={relatedParam.id} content={relatedParam.relationshipType}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{relatedParam.name}</span>
              <div className="flex items-center gap-0.5">
                {Array(relatedParam.overlapCount).fill(0).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-primary/60"></div>
                ))}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ParameterRelationships;
