import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

/**
 * GuidedTour component provides a simple step-by-step tour for new users
 * Updated with responsive positioning for different screen sizes
 */
const GuidedTour = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Update screen size state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Define tour steps
  const steps = [
    {
      title: "Welcome to SpecGen",
      content: "This tool helps you create detailed specifications for generating customized fiction.",
      position: "center" // This will be handled differently
    },
    {
      title: "Browse Genres",
      content: "Start by selecting a genre from the left panel. Each genre contains unique parameters for your story.",
      position: "left"
    },
    {
      title: "Explore Parameters",
      content: "After selecting a genre, browse its parameters in the middle panel. Add the ones you want to include.",
      position: "center-left" 
    },
    {
      title: "Select Multiple Genres",
      content: "You can select parameters from different genres. Simply click on another genre to see its parameters.",
      position: "left"
    },
    {
      title: "Configure Parameters",
      content: "Adjust your selected parameters in the right panel to fine-tune how your story will be generated.",
      position: "center-right"
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
  
  // Get position classes based on the position string and screen size
  const getPositionClasses = () => {
    // Handle welcome screen (center for all devices)
    if (currentStep === 0) {
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
    
    // For mobile devices, position everything at the bottom center
    if (isMobile) {
      return "bottom-20 left-1/2 -translate-x-1/2";
    }
    
    // For tablets, use simpler positioning
    if (isTablet) {
      const tabletPositions = {
        "left": "top-32 left-10",
        "center-left": "top-32 left-1/2 -translate-x-1/2",
        "center-right": "top-32 left-1/2 -translate-x-1/2",
        "right": "top-32 right-10",
        "center": "top-32 left-1/2 -translate-x-1/2",
      };
      return tabletPositions[steps[currentStep].position] || "top-32 left-1/2 -translate-x-1/2";
    }
    
    // For desktop
    const desktopPositions = {
      "left": "top-32 left-[15%]",
      "center-left": "top-32 left-[38%] -translate-x-1/2",
      "center-right": "top-32 left-[62%] -translate-x-1/2",
      "right": "top-32 left-[85%] -translate-x-1/2",
      "center": "top-32 left-1/2 -translate-x-1/2",
    };
    
    return desktopPositions[steps[currentStep].position] || "top-32 left-1/2 -translate-x-1/2";
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/5 z-50 pointer-events-none">
      <div
        className={`absolute pointer-events-auto ${getPositionClasses()}`}
      >
        <div className="bg-white rounded-lg shadow-lg border border-primary/20 w-72 p-3 animate-in fade-in duration-300">
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