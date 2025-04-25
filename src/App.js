import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { logDragEvent } from './utils/debug';
import { ThemeProvider } from './components/ThemeProvider';
import MainLayout from './components/layout/MainLayout';
import ResponsiveLayout, { Column } from './components/layout/ResponsiveLayout';
import GuidedTour from './components/GuidedTour';

// Lazy load components for better performance
const Categories = lazy(() => import('./pages/Categories'));
const Parameters = lazy(() => import('./pages/Parameters'));
const DraggedParameters = lazy(() => import('./pages/DraggedParameters'));
const Generation = lazy(() => import('./pages/Generation'));

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [draggedParameters, setDraggedParameters] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [showTour, setShowTour] = useState(false);
  
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

  const handleDragStart = (event) => {
    logDragEvent(event, 'DragStart');
    const { active } = event;
    setActiveDrag(active.data.current);
    console.log('Drag started with data:', active.data.current);
  };
  const handleDragEnd = (event) => {
    logDragEvent(event, 'DragEnd');
    const { active, over } = event;
    
    // Reset active drag
    setActiveDrag(null);
    
    if (over && over.id === 'droppable-area') {
      // Add parameter to draggedParameters if not already there
      setDraggedParameters(prev => {
        if (!prev.some(param => param.id === active.id)) {
          console.log('Dragging parameter data:', JSON.stringify(active.data.current));
          return [...prev, active.data.current];
        }
        return prev;
      });
    }
  };

  const handleDragOver = (event) => {
    // Optional: Add visual feedback when over a droppable area
    logDragEvent(event, 'DragOver');
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="specgen-theme">
      <MainLayout>
        {showTour && <GuidedTour onClose={() => setShowTour(false)} />}
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          autoScroll={true}
        >
          <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 h-full">
              <ResponsiveLayout className="bg-gray-50">
              <Column 
                span={3} 
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
                  <Categories onCategorySelect={setSelectedCategory} />
                </motion.div>
              </Column>
              
              <Column 
                span={4} 
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
                  <Parameters selectedCategory={selectedCategory} />
                </motion.div>
              </Column>
              
              <Column 
                span={4} 
                mobileOrder={2} 
                tabletSpan={2}
                className="bg-white rounded-lg shadow-sm"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="h-full overflow-auto"
                >
                  <DraggedParameters 
                    parameters={draggedParameters} 
                    onRemove={(id) => {
                      console.log('Removing parameter with ID:', id);
                      setDraggedParameters(prev => prev.filter(p => p.id !== id));
                    }}
                  />
                </motion.div>
              </Column>
              
              <Column 
                span={5} 
                mobileOrder={4} 
                tabletSpan={2}
                className="bg-white rounded-lg shadow-sm"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="h-full"
                >
                  <Generation 
                    setGeneratedContent={setGeneratedContent} 
                    generatedContent={generatedContent}
                    draggedParameters={draggedParameters}
                  />
                </motion.div>
              </Column>
            </ResponsiveLayout>
            </div>
          </Suspense>

          <DragOverlay>
            {activeDrag ? (
              <div className="p-3 rounded-md bg-white shadow-lg border border-primary">
                <p className="font-medium">{activeDrag.name}</p>
                <p className="text-sm text-muted-foreground">{activeDrag.description}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;