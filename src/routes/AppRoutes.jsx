// src/routes/AppRoutes.jsx
import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ResponsiveLayout, { Column } from '../components/layout/ResponsiveLayout';
import GuidedTour from '../components/GuidedTour';
import StoryGenerator from '../components/stories/StoryGenerator';
import GenerationControls from '../components/generation/GenerationControls';
import { randomizeParameterValue } from '../utils/parameterUtils';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary"></div>
  </div>
);

// Lazy load pages for better performance
const Landing = lazy(() => import('../pages/Landing'));
const Categories = lazy(() => import('../pages/Categories'));
const Parameters = lazy(() => import('../pages/Parameters'));
const SelectedParameters = lazy(() => import('../pages/SelectedParameters'));
const Generation = lazy(() => import('../pages/Generation')); // Still using Generation for the generating route
const About = lazy(() => import('../pages/About'));

// Create simple components for Library and Story pages until we can properly implement the files
const LibraryPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-card rounded-md border shadow-sm h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <Generation viewMode="library" />
      </Suspense>
    </div>
  );
};

const StoryPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-card rounded-md border shadow-sm h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <Generation viewMode="story" />
      </Suspense>
    </div>
  );
};

const AppRoutes = ({ 
  showTour,
  setShowTour,
  selectedCategory,
  setSelectedCategory,
  selectedParameters,
  setSelectedParameters,
  generatedContent,
  setGeneratedContent,
  generationInProgress,
  setGenerationInProgress
}) => {
  const navigate = useNavigate();

  const handleParameterSelect = (parameter) => {
    // Prevent duplicates
    if (!selectedParameters.some(p => p.id === parameter.id)) {
      // Initialize the parameter with a random value
      const initializedParameter = {
        ...parameter,
        value: randomizeParameterValue(parameter)
      };
      setSelectedParameters(prev => [initializedParameter, ...prev]);
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
    navigate('/generating');
  };

  const handleBackToHome = () => {
    // Navigate to parameters page for editing
    navigate('/parameters');
  };

  return (
    <>
      {/* Tour overlay */}
      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}

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

        <Route path="/generating" element={
          <div className="bg-card rounded-md border shadow-sm h-full">
            <Suspense fallback={<LoadingSpinner />}>
              <Generation
                setGeneratedContent={setGeneratedContent}
                generatedContent={generatedContent}
                selectedParameters={selectedParameters}
                setSelectedParameters={setSelectedParameters}
                generationInProgress={true}
                setGenerationInProgress={setGenerationInProgress}
                viewMode="generating"
              />
            </Suspense>
          </div>
        } />

        {/* Individual Story Page */}
        <Route path="/story" element={
          <div className="bg-card rounded-md border shadow-sm h-full">
            <Suspense fallback={<LoadingSpinner />}>
              <Generation
                setGeneratedContent={setGeneratedContent}
                generatedContent={generatedContent}
                selectedParameters={selectedParameters}
                setSelectedParameters={setSelectedParameters}
                generationInProgress={false}
                setGenerationInProgress={setGenerationInProgress}
                viewMode="story"
              />
            </Suspense>
          </div>
        } />

        {/* Library Page */}
        <Route path="/library" element={
          <div className="bg-card rounded-md border shadow-sm h-full">
            <Suspense fallback={<LoadingSpinner />}>
              <Generation
                setGeneratedContent={setGeneratedContent}
                generatedContent={generatedContent}
                selectedParameters={selectedParameters}
                setSelectedParameters={setSelectedParameters}
                generationInProgress={false}
                setGenerationInProgress={setGenerationInProgress}
                viewMode="library"
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
    </>
  );
};

export default AppRoutes;