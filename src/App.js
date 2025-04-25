import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Move } from 'lucide-react';
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

          <DragOverlay dropAnimation={{
            duration: 400,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeDrag ? (
              <div className="p-4 rounded-lg bg-white shadow-xl border-2 border-primary/50 animate-pulse-slow pointer-events-none max-w-xs">
                <div className="flex gap-2 items-start">
                  <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                    <Move className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{activeDrag.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{activeDrag.description}</p>
                    
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {activeDrag.categoryName && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm">
                          {activeDrag.categoryName}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-foreground/80 rounded-sm border border-border">
                        {activeDrag.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-center bg-primary/5 p-1 rounded border border-primary/10">
                  Drop in the "Selected Parameters" panel
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;