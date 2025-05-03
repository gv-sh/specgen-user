// src/App.js
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Theme and Layout Components
import { ThemeProvider } from './components/theme/theme-provider';
import MainLayout from './components/layout/MainLayout';
import ResponsiveLayout, { Column } from './components/layout/ResponsiveLayout';
import GuidedTour from './components/GuidedTour';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary"></div>
  </div>
);

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Categories = lazy(() => import('./pages/Categories'));
const Parameters = lazy(() => import('./pages/Parameters'));
const SelectedParameters = lazy(() => import('./pages/SelectedParameters'));
const Library = lazy(() => import('./pages/Generation')); // Using the Generation component as Library
const About = lazy(() => import('./pages/About'));

// Main App Component
function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

// App Content Component with shared state
function AppContent() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generationInProgress, setGenerationInProgress] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has seen the guided tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('anantabhavi-tour-completed');
    if (!hasSeenTour && location.pathname === '/parameters') {
      // Slight delay to show tour after initial render
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Parameter management handlers
  const handleParameterSelect = (parameter) => {
    // Prevent duplicates
    if (!selectedParameters.some(p => p.id === parameter.id)) {
      setSelectedParameters(prev => [...prev, parameter]);
    }
  };

  const handleParameterRemove = (parameter) => {
    setSelectedParameters(prev => prev.filter(p => p.id !== parameter.id));
  };

  const handleParameterValueUpdate = (parameterId, newValue) => {
    setSelectedParameters(prev =>
      prev.map(param =>
        param.id === parameterId ? { ...param, value: newValue } : param
      )
    );
  };

  // Navigation handlers
  const handleNavigateToGenerate = () => {
    // Store generation request details in session storage to handle page refreshes
    if (selectedParameters.length > 0) {
      // Save the current parameters for potential recovery
      sessionStorage.setItem('specgen-parameters', JSON.stringify(selectedParameters));
      sessionStorage.setItem('specgen-auto-generate', 'true');
      setGenerationInProgress(true);
    }
    navigate('/library');
  };

  const handleBackToHome = () => {
    // Navigate to parameters page for editing
    navigate('/parameters');
  };

  // UI handlers
  const handleShowTour = () => {
    setShowTour(true);
  };

  return (
    <>
      {/* Tour overlay */}
      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}

      {/* Main app layout */}
      <MainLayout onShowTour={handleShowTour}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Landing />
            </Suspense>
          } />

          {/* Parameters Page */}
          <Route path="/parameters" element={
            <ResponsiveLayout>
              {/* Category Selection Column */}
              <Column span={4} mobileOrder={1} tabletSpan={2} position="left">
                <Suspense fallback={<LoadingSpinner />}>
                  <Categories
                    onCategorySelect={setSelectedCategory}
                    selectedCategory={selectedCategory}
                  />
                </Suspense>
              </Column>

              {/* Parameter List Column */}
              <Column span={4} mobileOrder={3} tabletSpan={2} position="middle">
                <Suspense fallback={<LoadingSpinner />}>
                  <Parameters
                    selectedCategory={selectedCategory}
                    selectedParameters={selectedParameters}
                    onParameterSelect={handleParameterSelect}
                    onParameterRemove={handleParameterRemove}
                  />
                </Suspense>
              </Column>

              {/* Selected Parameters Column */}
              <Column span={8} mobileOrder={2} tabletSpan={4} position="right">
                <Suspense fallback={<LoadingSpinner />}>
                  <SelectedParameters
                    parameters={selectedParameters}
                    onRemoveParameter={handleParameterRemove}
                    onUpdateParameterValue={handleParameterValueUpdate}
                    onNavigateToGenerate={handleNavigateToGenerate}
                  />
                </Suspense>
              </Column>
            </ResponsiveLayout>
          } />

          {/* Library Page (formerly Generation) */}
          <Route path="/library" element={
            <div className="bg-card rounded-md border shadow-sm h-full">
              <Suspense fallback={<LoadingSpinner />}>
                <Library
                  setGeneratedContent={setGeneratedContent}
                  generatedContent={generatedContent}
                  selectedParameters={selectedParameters}
                  setSelectedParameters={setSelectedParameters}
                  generationInProgress={generationInProgress}
                  setGenerationInProgress={setGenerationInProgress}
                  onBackToHome={handleBackToHome}
                />
              </Suspense>
            </div>
          } />
          
          {/* Redirect /generate to /library for backward compatibility */}
          <Route path="/generate" element={<Navigate to="/library" replace />} />

          {/* About Page */}
          <Route path="/about" element={
            <div className="bg-background h-full">
              <Suspense fallback={<LoadingSpinner />}>
                <About />
              </Suspense>
            </div>
          } />
        </Routes>
      </MainLayout>
    </>
  );
}

export default App;