// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="container max-w-screen-2xl">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-8 tracking-tight">
            What kind of future do you envision? How do you define progress, and what does an ideal society look like? Who gets to decide what the future looks like—and who gets left behind?
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl font-light">
            Explore speculative futures with us—challenge your assumptions, question what is possible, and create the future you desire.
          </p>

          <Link
            to="/parameters"
            className="inline-flex items-center bg-primary text-accent-foreground 
              px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;