// src/components/stories/StoryGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const StoryGenerator = ({
  loading,
  error,
  showRecoveryBanner,
  setGenerationInProgress
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => {
    let progressInterval = null;

    // Show progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
    }, 500);

    // Clean up
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  // When loading stops, set progress to 100% and redirect
  useEffect(() => {
    if (!loading && progress < 100) {
      setProgress(100);
      
      // Redirect to library after completion
      setTimeout(() => {
        navigate('/library');
      }, 500);
    }
  }, [loading, progress, navigate]);

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