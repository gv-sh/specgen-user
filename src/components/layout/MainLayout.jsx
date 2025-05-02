// src/components/layout/MainLayout.jsx
import React from 'react';
import { Button } from '../ui/button';
import { HelpCircle, ArrowLeft, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';
import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children, onShowTour, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGeneratePage = location.pathname === '/generate';
  
  const handleBackClick = () => {
    navigate('/');
  };
  
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <a href="/" className="flex items-center gap-2 mr-6">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">SpecGen</span>
            </a>
            
            {isGeneratePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="mr-2 gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Parameters</span>
              </Button>
            )}
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-2">
            {onShowTour && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowTour}
                className="gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Tour</span>
              </Button>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container pt-20 pb-16">
        <div className="h-[calc(100vh-theme(spacing.20)-theme(spacing.16))]">
          {children}
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 border-t py-4 text-center text-sm text-muted-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container">
          <p>
            ©️ Conceptualized by <a 
              href="https://www.1377.co.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >13°77°</a> and developed in collaboration with <a 
              href="https://mathscapes.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >Mathscapes</a>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;