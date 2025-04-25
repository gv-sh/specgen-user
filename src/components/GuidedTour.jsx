import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

/**
 * GuidedTour component provides a simple step-by-step tour for new users
 */
const GuidedTour = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Define tour steps
  const steps = [
    {
      title: "Welcome to SpecGen",
      content: "This tool helps you create detailed specifications for generating customized content.",
      position: "center"
    },
    {
      title: "Choose Categories",
      content: "Start by selecting categories from the left panel. These define the themes of your content.",
      position: "left"
    },
    {
      title: "Configure Parameters",
      content: "Adjust parameters to fine-tune how your content will be generated.",
      position: "center" 
    },
    {
      title: "Drag Parameters",
      content: "Drag the most important parameters to 'Selected Parameters' to build your specification.",
      position: "right"
    },
    {
      title: "Generate Content",
      content: "Click 'Generate' to create content based on your selected parameters.",
      position: "right"
    }
  ];
  
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
