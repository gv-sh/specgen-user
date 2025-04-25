import React from 'react';
import { GripVertical } from 'lucide-react';

const DragIndicator = ({ active = false, size = 12 }) => {
  return (
    <div className={`
      flex-shrink-0 
      text-foreground/50
      transition-colors
      ${active ? 'text-primary' : ''}
    `}>
      <GripVertical size={size} />
    </div>
  );
};

export default DragIndicator;