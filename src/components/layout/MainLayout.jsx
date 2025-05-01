// src/components/layout/MainLayout.jsx
import React from 'react';
import { Button } from '../ui/button';
import { HelpCircle, ArrowLeft, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';

const MainLayout = ({ children, onShowTour, showBackButton, onBackClick, className }) => {
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mr-2 gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <a href="/" className="flex items-center gap-2 mr-6">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-semibold">SpecGen</span>
              </a>
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
      <main className="flex-1 container py-6">
        <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.12))]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;