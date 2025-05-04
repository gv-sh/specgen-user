// src/components/stories/StoryGenerator.jsx - Modified version
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { generateContent } from '../../services/api';

const StoryGenerator = ({
  loading,
  error,
  showRecoveryBanner,
  selectedParameters,
  setSelectedParameters,
  setGenerationInProgress,
  setActiveStory
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [generationError, setGenerationError] = useState(null);
  // Use ref to track if generation has started
  const generationStartedRef = useRef(false);

  useEffect(() => {
    let progressInterval = null;

    const generateStory = async () => {
      // Remove generating lock to allow new generations
      sessionStorage.removeItem('specgen-generating');

      try {
        const paramsString = sessionStorage.getItem('specgen-parameters');
        const storyYear = sessionStorage.getItem('specgen-story-year');

        if (!paramsString) {
          setGenerationError('No parameters found for generation');
          return;
        }

        const parsedParams = JSON.parse(paramsString);
        const parameterValues = {};

        // Group by category
        parsedParams.forEach(param => {
          if (!parameterValues[param.categoryId]) {
            parameterValues[param.categoryId] = {};
          }
          parameterValues[param.categoryId][param.id] = param.value;
        });

        // Show progress
        progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 5, 95));
        }, 500);

        // Call API
        const year = storyYear ? parseInt(storyYear, 10) : null;
        const response = await generateContent(
          parameterValues,
          Object.keys(parameterValues),
          'combined',
          year,
          null
        );

        clearInterval(progressInterval);
        setProgress(100);

        // Clear flags but keep parameters
        sessionStorage.removeItem('specgen-auto-generate');

        // Update state
        if (typeof setGenerationInProgress === 'function') {
          setGenerationInProgress(false);
        }

        // Handle navigation
        if (response.success && response.generatedStory) {
          console.log("Story generated successfully:", response.generatedStory);
          // Also add the new story to any global stores
          sessionStorage.setItem('latest-specgen-story', JSON.stringify(response.generatedStory));
          
          if (typeof setActiveStory === 'function') {
            setActiveStory(response.generatedStory);
          }
          setTimeout(() => navigate('/library'), 500);
        } else {
          navigate('/library');
        }
      } catch (err) {
        console.error('Generation error:', err);
        setGenerationError(err.message || 'Failed to generate story');
        if (progressInterval) clearInterval(progressInterval);
        if (typeof setGenerationInProgress === 'function') {
          setGenerationInProgress(false);
        }
      }
    };

    generateStory();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="container max-w-6xl mx-auto h-full">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Generating your story</h3>
          <p className="text-muted-foreground mb-4">
            {showRecoveryBanner
              ? "Resuming generation after navigation..."
              : "This may take a few moments..."}
          </p>

          {/* Progress bar */}
          <div className="w-64 bg-muted rounded-full h-2.5 mb-4 mx-auto">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Error message if any */}
          {(error || generationError) && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error || generationError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;