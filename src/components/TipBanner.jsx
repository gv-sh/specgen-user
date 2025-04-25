import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

/**
 * TipBanner component shows helpful tips and information to users
 * 
 * @param {Object} props
 * @param {string} props.message - The tip message to display
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClose - Function to call when the banner is closed
 */
const TipBanner = ({ message, className = '', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`rounded-md bg-primary/10 border border-primary/20 p-2 mb-3 ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-primary" />
        </div>
        
        <div className="flex-1 text-xs text-primary/90">
          {message}
        </div>
        
        <button 
          onClick={handleClose}
          className="flex-shrink-0 text-primary/60 hover:text-primary transition-colors p-1 -mt-1 -mr-1 rounded-sm"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TipBanner;
