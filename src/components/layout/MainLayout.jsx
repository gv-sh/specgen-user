import React from 'react';
import { useTheme } from '../ThemeProvider';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Moon, Sun } from 'lucide-react';

const MainLayout = ({ children }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="mr-4 flex">
            <a href="/" className="flex items-center">
              <span className="text-lg font-semibold">SpecGen</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="mr-2"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
      <footer className="border-t py-4 md:py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SpecGen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;