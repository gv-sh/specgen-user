// src/pages/Landing.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GalaxyParticles from '../components/ui/GalaxyParticles';
import Shaders from '../components/ui/Shaders';
import { useParameters } from '../contexts/ParameterContext';

const Landing = ({ onClearSession }) => {
  const { removeAllParameters } = useParameters();

  useEffect(() => {
    // Clear all parameters when landing page is accessed
    removeAllParameters();
    // Clear App-level state and sessionStorage
    if (onClearSession) {
      onClearSession();
    }
  }, [removeAllParameters, onClearSession]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="fixed w-full h-screen overflow-hidden">
      {/* Background particle system */}
      <GalaxyParticles />
      <Shaders />
      {/* Foreground content */}
      <div className="content__inner absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
      <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-[84px] font-bold text-primary leading-[72px] mb-8 tracking-tight">
            What kind of <em>futures</em> do you envision? 
          </h1>
          <p className="text-[24px] text-muted-foreground mb-8 font-regular">
            Explore speculative futures with us—challenge your assumptions, question what is possible, and create the future you desire.
          </p>
          <Link
            to="/parameters"
            className="inline-flex items-center bg-primary text-primary-foreground 
              px-6 py-3 rounded-md text-lg font-light hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      
      </div>
    </div>
    </div>
  );
};

export default Landing;

