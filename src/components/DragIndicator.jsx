import React from 'react';
import { GripVertical } from 'lucide-react';
import { Tooltip } from './ui/tooltip';

const DragIndicator = ({ active = false, size = 16 }) => {
  return (
    <Tooltip content="Drag this parameter to the Selected Parameters panel">
      <div className={`
        flex-shrink-0 
        text-foreground/70 
        bg-secondary/70 
        p-1 
        rounded 
        group-hover:bg-secondary 
        group-hover:text-foreground
        transition-colors
        ${active ? 'bg-primary/20 text-primary' : ''}
      `}>
        <GripVertical size={size} />
      </div>
    </Tooltip>
  );
};

export default DragIndicator;