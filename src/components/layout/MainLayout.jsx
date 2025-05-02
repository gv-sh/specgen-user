// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { HelpCircle, ArrowLeft, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';
import { Tooltip } from '../ui/tooltip';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const MainLayout = ({ children, onShowTour, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isGeneratePage = location.pathname === '/generate';
  const isParametersPage = location.pathname === '/';
  
  const handleBackClick = () => {
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: null },
    { name: 'About', path: '/about', icon: null },
  ];
  
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center w-full">
            {/* Logo with Tooltip */}
            <Tooltip 
              content="Anantabhavi: Infinite Imagination" 
              position="bottom"
            >
              <a href="/" className="font-semibold text-lg">
                Anantabhavi
              </a>
            </Tooltip>
            
            <div className="ml-auto flex items-center">
              {isGeneratePage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="mr-4 gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Parameters</span>
                </Button>
              )}
              
              <ThemeToggle className="mr-4" />
              
              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Slide-out Menu */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 top-14 z-40 bg-transparent"
            onClick={closeMenu}
          >
            <div 
              className={cn(
                "absolute top-0 right-0 w-64 h-auto max-h-[calc(100vh-4rem)] overflow-auto",
                "bg-card border rounded-b-lg shadow-lg p-2",
                "transform transition-transform duration-300 ease-in-out",
                "origin-top-right"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center w-full p-2 rounded-md text-sm",
                      location.pathname === item.path 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                
                {/* Conditionally render Tour option */}
                {(isParametersPage || isGeneratePage) && onShowTour && (
                  <button
                    onClick={() => {
                      onShowTour();
                      closeMenu();
                    }}
                    className="flex items-center w-full p-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Tour
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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