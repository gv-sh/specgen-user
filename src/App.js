import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from './components/ThemeProvider';
import MainLayout from './components/layout/MainLayout';
import Categories from './pages/Categories';
import Parameters from './pages/Parameters';
import Generation from './pages/Generation';
import { Card } from './components/ui/card';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);

  return (
    <ThemeProvider defaultTheme="light" storageKey="specgen-theme">
      <MainLayout>
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
            <motion.div 
              className="md:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full overflow-auto shadow-md rounded-xl">
                <div className="p-4">
                  <Categories onCategorySelect={setSelectedCategory} />
                </div>
              </Card>
            </motion.div>
            
            <motion.div 
              className="md:col-span-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="h-full overflow-auto shadow-md rounded-lg">
                <div className="p-4">
                  <Parameters selectedCategory={selectedCategory} />
                </div>
              </Card>
            </motion.div>
            
            <motion.div 
              className="md:col-span-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="h-full overflow-auto shadow-md rounded-xl border-2 border-primary/10">
                <div className="p-5">
                  <Generation setGeneratedContent={setGeneratedContent} generatedContent={generatedContent} />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;