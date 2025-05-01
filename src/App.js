// src/App.js
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme/theme-provider';
import MainLayout from './components/layout/MainLayout';
import ResponsiveLayout, { Column } from './components/layout/ResponsiveLayout';
import GuidedTour from './components/GuidedTour';

// Lazy load components for better performance
const Categories = lazy(() => import('./pages/Categories'));
const Parameters = lazy(() => import('./pages/Parameters'));
const SelectedParameters = lazy(() => import('./pages/SelectedParameters'));
const Generation = lazy(() => import('./pages/Generation'));

// Main App Component
function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={<GenerationPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// HomePage Component
function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();
  
  // Check if user has seen the guided tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('specgen-tour-completed');
    if (!hasSeenTour) {
      // Slight delay to show tour after initial render
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Function to manually show the tour
  const handleShowTour = () => {
    setShowTour(true);
  };

  // Handle parameter selection
  const handleParameterSelect = (parameter) => {
    // Prevent duplicates
    if (!selectedParameters.some(p => p.id === parameter.id)) {
      setSelectedParameters(prev => [...prev, parameter]);
    }
  };

  // Handle parameter removal
  const handleParameterRemove = (parameter) => {
    setSelectedParameters(prev => 
      prev.filter(p => p.id !== parameter.id)
    );
  };

  // Handle parameter value update
  const handleParameterValueUpdate = (parameterId, newValue) => {
    setSelectedParameters(prev => 
      prev.map(param => 
        param.id === parameterId 
          ? { ...param, value: newValue } 
          : param
      )
    );
  };

  // Handle navigation to generation page
  const handleNavigateToGenerate = () => {
    // Store selected parameters in localStorage for the generation page
    localStorage.setItem('selectedParameters', JSON.stringify(selectedParameters));
    navigate('/generate');
  };

  return (
    <MainLayout onShowTour={handleShowTour}>
      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}
      
      <ResponsiveLayout>
        <Column 
          span={4}
          mobileOrder={1} 
          tabletSpan={2}
        >
          <Categories 
            onCategorySelect={setSelectedCategory} 
            selectedCategory={selectedCategory}
          />
        </Column>
        
        <Column 
          span={4}
          mobileOrder={3} 
          tabletSpan={2}
        >
          <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary"></div></div>}>
            <Parameters 
              selectedCategory={selectedCategory}
              selectedParameters={selectedParameters}
              onParameterSelect={handleParameterSelect}
              onParameterRemove={handleParameterRemove}
            />
          </Suspense>
        </Column>
        
        <Column 
          span={8}
          mobileOrder={2} 
          tabletSpan={4}
        >
          <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary"></div></div>}>
            <SelectedParameters 
              parameters={selectedParameters}
              onRemoveParameter={handleParameterRemove}
              onUpdateParameterValue={handleParameterValueUpdate}
              onNavigateToGenerate={handleNavigateToGenerate}
            />
          </Suspense>
        </Column>
      </ResponsiveLayout>
    </MainLayout>
  );
}

// Generation Page Component
function GenerationPage() {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const navigate = useNavigate();

  // Load selected parameters from localStorage
  useEffect(() => {
    const storedParameters = localStorage.getItem('selectedParameters');
    if (storedParameters) {
      setSelectedParameters(JSON.parse(storedParameters));
    }
  }, []);

  // Handle navigation back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <MainLayout showBackButton={true} onBackClick={handleBackToHome}>
      <div className="bg-card rounded-md border shadow-sm p-4 h-full">
        <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary"></div></div>}>
          <Generation 
            setGeneratedContent={setGeneratedContent} 
            generatedContent={generatedContent}
            selectedParameters={selectedParameters}
            onBackToHome={handleBackToHome}
          />
        </Suspense>
      </div>
    </MainLayout>
  );
}

export default App;