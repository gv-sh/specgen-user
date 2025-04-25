import React from 'react';
import { useTheme } from '../ThemeProvider';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Moon, Sun, Zap } from 'lucide-react';

const MainLayout = ({ children }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
          <div className="mr-4 flex">
            <a href="/" className="flex items-center space-x-2">
              <Zap className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold tracking-tight">SpecGen</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full h-9 w-9 mr-2 text-foreground/80 hover:text-foreground"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
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