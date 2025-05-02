import React, { useState, useEffect } from 'react';
import { ChevronRight, X, BookOpen, Sparkles, Dices, ZoomIn, Settings2, Layers, Boxes } from 'lucide-react';

/**
 * GuidedTour component provides a simple step-by-step tour for new users
 * Updated with responsive positioning and improved visual design
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
  
  // Define tour steps with icons
  const steps = [
    {
      title: "Welcome to SpecGen",
      content: "This tool helps you create detailed specifications for generating customized fiction and imagery based on your chosen parameters.",
      position: "center",
      icon: <Sparkles className="h-4 w-4 text-primary" />
    },
    {
      title: "Browse Genres",
      content: "Start by selecting a genre from the left panel. Each genre contains unique parameters for your story.",
      position: "left",
      icon: <BookOpen className="h-4 w-4 text-primary" />
    },
    {
      title: "Explore Parameters",
      content: "After selecting a genre, browse its parameters in the middle panel. Add the ones you want to include in your generation.",
      position: "center-left",
      icon: <Layers className="h-4 w-4 text-primary" />
    },
    {
      title: "Select Multiple Genres",
      content: "You can select parameters from different genres. Simply click on another genre to see its parameters.",
      position: "left",
      icon: <Boxes className="h-4 w-4 text-primary" />
    },
    {
      title: "Configure Parameters",
      content: "Adjust your selected parameters in the right panel to fine-tune how your story will be generated.",
      position: "center-right",
      icon: <Settings2 className="h-4 w-4 text-primary" />
    },
    {
      title: "Randomize Options",
      content: "Can't decide? Use the randomize buttons to quickly generate parameter values.",
      position: "right",
      icon: <Dices className="h-4 w-4 text-primary" />
    },
    {
      title: "Generate Content",
      content: "When you're ready, click 'Generate' to create a story and image based on your selected parameters.",
      position: "right",
      icon: <ZoomIn className="h-4 w-4 text-primary" />
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
      return "bottom-24 left-1/2 -translate-x-1/2";
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
    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm pointer-events-auto">
      <div
        className={`absolute pointer-events-auto ${getPositionClasses()}`}
      >
        <div className="bg-card rounded-lg shadow-lg border border-primary/20 w-72 p-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              {steps[currentStep].icon}
              <h3 className="text-base font-medium text-foreground">{steps[currentStep].title}</h3>
            </div>
            <button 
              onClick={completeTour}
              className="text-muted-foreground hover:text-foreground p-1 rounded-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-5">
            {steps[currentStep].content}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 w-5 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-primary/20'}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md flex items-center font-medium hover:bg-primary/90 transition-colors"
            >
              {currentStep < steps.length - 1 ? (
                <>Next <ChevronRight className="h-3.5 w-3.5 ml-1" /></>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;