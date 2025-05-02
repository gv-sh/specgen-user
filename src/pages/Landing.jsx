// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  BookOpen, 
  Sparkles, 
  Settings, 
  ArrowRight 
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-6xl mx-auto px-4 py-16 flex-grow flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-3">
              <Zap className="h-10 w-10 text-primary" />
              Anantabhavi
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Unleash infinite imagination through AI-powered speculative fiction 
              and imagery generation.
            </p>
            
            <div className="flex space-x-4">
              <Link 
                to="/" 
                className="inline-flex items-center bg-primary text-primary-foreground 
                  px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center border border-input 
                  px-6 py-3 rounded-md hover:bg-accent transition-colors"
              >
                Learn More
                <BookOpen className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Creative Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate unique stories and images
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 text-center">
              <Settings className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Customizable</h3>
              <p className="text-sm text-muted-foreground">
                Tailor your creative process
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 text-center col-span-2">
              <BookOpen className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Infinite Possibilities</h3>
              <p className="text-sm text-muted-foreground">
                Explore boundless narrative landscapes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;