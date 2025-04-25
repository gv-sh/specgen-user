import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { logDragEvent } from './utils/debug';
import { ThemeProvider } from './components/ThemeProvider';
import MainLayout from './components/layout/MainLayout';
import Categories from './pages/Categories';
import Parameters from './pages/Parameters';
import DraggedParameters from './pages/DraggedParameters';
import Generation from './pages/Generation';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [draggedParameters, setDraggedParameters] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);

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
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          autoScroll={true}
        >
          <div className="container mx-auto max-w-full px-2 sm:px-3 lg:px-4">
            <div className="grid grid-cols-1 md:grid-cols-16 gap-3 h-full">
            <motion.div 
              className="md:col-span-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="unsplash-card h-full overflow-auto">
                <div className="p-3">
                  <Categories onCategorySelect={setSelectedCategory} />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:col-span-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="unsplash-card h-full overflow-auto">
                <div className="p-3">
                  <Parameters selectedCategory={selectedCategory} />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:col-span-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="unsplash-card h-full overflow-auto">
                <div className="p-3">
                  <DraggedParameters 
                    parameters={draggedParameters} 
                    onRemove={(id) => {
                    console.log('Removing parameter with ID:', id);
                    setDraggedParameters(prev => prev.filter(p => p.id !== id));
                  }}
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:col-span-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="unsplash-card h-full overflow-auto">
                <div className="p-3">
                  <Generation 
                    setGeneratedContent={setGeneratedContent} 
                    generatedContent={generatedContent}
                    draggedParameters={draggedParameters}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
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