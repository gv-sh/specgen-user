// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { HelpCircle, ArrowLeft, Zap, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../theme/theme-toggle';
import { Tooltip } from '../ui/tooltip';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const MainLayout = ({ children, onShowTour, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isGeneratePage = location.pathname === '/generate';
  
  const handleBackClick = () => {
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: <Zap className="h-4 w-4 mr-2" /> },
    { name: 'About', path: '/about', icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    // Add more menu items as needed
  ];
  
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col", className)}>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex items-center w-full">
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="mr-2 lg:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {/* Logo with Tooltip */}
            <Tooltip 
              content="Anantabhavi: Infinite Imagination" 
              position="bottom"
            >
              <a href="/" className="flex items-center gap-2 mr-6">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-semibold">Anantabhavi</span>
              </a>
            </Tooltip>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4 ml-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center text-sm hover:text-primary",
                    location.pathname === item.path ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center ml-auto lg:ml-0">
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
              
              {onShowTour && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowTour}
                  className="gap-1.5 mr-2"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Tour</span>
                </Button>
              )}
              
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-14 bg-background/95 backdrop-blur-sm z-40 lg:hidden">
            <div className="container pt-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleMenu}
                  className={cn(
                    "flex items-center w-full p-3 rounded-md hover:bg-accent",
                    location.pathname === item.path 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
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