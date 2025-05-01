import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

/**
 * GuidedTour component provides a simple step-by-step tour for new users
 * Updated to reflect the folder-like navigation flow and to handle being shown multiple times
 */
const GuidedTour = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Define tour steps
  const steps = [
    {
      title: "Welcome to SpecGen",
      content: "This tool helps you create detailed specifications for generating customized fiction.",
      position: "center"
    },
    {
      title: "Browse Genres",
      content: "Start by selecting a genre from the left panel. Each genre contains unique parameters for your story.",
      position: "left"
    },
    {
      title: "Explore Parameters",
      content: "After selecting a genre, browse its parameters in the middle panel. Add the ones you want to include.",
      position: "center" 
    },
    {
      title: "Select Multiple Genres",
      content: "You can select parameters from different genres. Simply click on another genre to see its parameters.",
      position: "center"
    },
    {
      title: "Configure Parameters",
      content: "Adjust your selected parameters in the right panel to fine-tune how your story will be generated.",
      position: "right"
    },
    {
      title: "Generate Content",
      content: "When you're ready, click 'Generate' to create a story based on your selected parameters.",
      position: "right"
    }
  ];
  
  // Reset state when opened (useful when tour is shown multiple times)
  useEffect(() => {
    setCurrentStep(0);
    setIsVisible(true);
  }, []);
  
  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };
  
  // Complete the tour
  const completeTour = () => {
    setIsVisible(false);
    
    // Store in localStorage that the user has seen the tour
    localStorage.setItem('specgen-tour-completed', 'true');
    
    // Notify parent component
    if (onClose) onClose();
  };
  
  // Position the tour card based on the step
  const getPositionClasses = () => {
    switch (steps[currentStep].position) {
      case 'left':
        return 'left-4 top-32';
      case 'right':
        return 'right-4 top-32';
      case 'center':
      default:
        return 'left-1/2 transform -translate-x-1/2 top-32';
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/5 z-50 pointer-events-none">
      <div className={`absolute ${getPositionClasses()} pointer-events-auto`}>
        <div className="bg-white rounded-lg shadow-lg border border-primary/20 w-72 p-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-primary">{steps[currentStep].title}</h3>
            <button 
              onClick={completeTour}
              className="text-muted-foreground hover:text-foreground p-1 rounded-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            {steps[currentStep].content}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 w-4 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-primary/20'}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center"
            >
              {currentStep < steps.length - 1 ? (
                <>Next <ChevronRight className="h-3 w-3 ml-1" /></>
              ) : (
                'Got it!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;