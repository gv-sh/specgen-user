import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeProvider } from './components/ThemeProvider';
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
    <ThemeProvider defaultTheme="light" storageKey="specgen-theme">
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
      
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 h-full">
        <ResponsiveLayout className="bg-gray-50">
          <Column 
            span={4}  // 1 part of the 1:1:2 ratio
            mobileOrder={1} 
            tabletSpan={2}
            className="bg-white rounded-lg shadow-sm"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Categories 
                onCategorySelect={setSelectedCategory} 
                selectedCategory={selectedCategory}
              />
            </motion.div>
          </Column>
          
          <Column 
            span={4}  // 1 part of the 1:1:2 ratio
            mobileOrder={3} 
            tabletSpan={2}
            className="bg-white rounded-lg shadow-sm"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="h-full overflow-auto"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <Parameters 
                  selectedCategory={selectedCategory}
                  selectedParameters={selectedParameters}
                  onParameterSelect={handleParameterSelect}
                  onParameterRemove={handleParameterRemove}
                />
              </Suspense>
            </motion.div>
          </Column>
          
          <Column 
            span={8}  // 2 parts of the 1:1:2 ratio
            mobileOrder={2} 
            tabletSpan={4}  // Adjust tablet span to maintain ratio
            className="bg-white rounded-lg shadow-sm"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="h-full overflow-auto"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <SelectedParameters 
                  parameters={selectedParameters}
                  onRemoveParameter={handleParameterRemove}
                  onUpdateParameterValue={handleParameterValueUpdate}
                  onNavigateToGenerate={handleNavigateToGenerate}
                />
              </Suspense>
            </motion.div>
          </Column>
        </ResponsiveLayout>
      </div>
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
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 h-full">
        <div className="bg-white rounded-lg shadow-sm p-4 h-full">
          <Suspense fallback={<div>Loading...</div>}>
            <Generation 
              setGeneratedContent={setGeneratedContent} 
              generatedContent={generatedContent}
              selectedParameters={selectedParameters}
              onBackToHome={handleBackToHome}
            />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;