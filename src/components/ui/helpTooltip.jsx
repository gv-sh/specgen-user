import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from './tooltip';

/**
 * HelpTooltip component provides context-sensitive help in a tooltip
 * 
 * @param {Object} props
 * @param {string} props.content - The help text to display
 * @param {string} props.title - Optional title for the tooltip
 * @param {string} props.className - Optional additional classes
 */
const HelpTooltip = ({ content, title, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Tooltip
      content={
        <div className="max-w-xs">
          {title && <div className="font-medium mb-1">{title}</div>}
          <div className="text-xs">{content}</div>
        </div>
      }
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-3 w-3 text-muted-foreground/70 hover:text-muted-foreground cursor-help" />
      </div>
    </Tooltip>
  );
};

export default HelpTooltip;
