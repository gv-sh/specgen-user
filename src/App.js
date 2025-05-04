// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Theme and Layout Components
import { ThemeProvider } from './components/theme/theme-provider';
import MainLayout from './components/layout/MainLayout';
import AppRoutes from './routes/AppRoutes';
import { ParameterProvider } from './contexts/ParameterContext';

// Main App Component
function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <ParameterProvider>
          <AppContent />
        </ParameterProvider>
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

  return (
    <MainLayout onShowTour={() => setShowTour(true)}>
      <AppRoutes 
        showTour={showTour}
        setShowTour={setShowTour}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedParameters={selectedParameters}
        setSelectedParameters={setSelectedParameters}
        generatedContent={generatedContent}
        setGeneratedContent={setGeneratedContent}
        generationInProgress={generationInProgress}
        setGenerationInProgress={setGenerationInProgress}
      />
    </MainLayout>
  );
}

export default App;