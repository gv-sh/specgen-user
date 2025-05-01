// src/components/layout/MainLayout.jsx - Updated with back button
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Zap, HelpCircle, ArrowLeft } from 'lucide-react';

const MainLayout = ({ children, onShowTour, showBackButton, onBackClick }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
          <div className="mr-4 flex">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mr-2 rounded-full h-9 px-3 text-foreground/80 hover:text-foreground flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span className="text-sm">Back</span>
              </Button>
            ) : (
              <a href="/" className="flex items-center space-x-2">
                <Zap className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold tracking-tight">SpecGen</span>
              </a>
            )}
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* Tour button */}
            {onShowTour && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowTour}
                className="rounded-full h-9 px-3 text-foreground/80 hover:text-foreground flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1.5" />
                <span className="text-sm">Tour</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-[calc(100vh-4rem)]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default MainLayout;