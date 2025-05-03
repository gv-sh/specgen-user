// src/components/stories/StoryGenerator.jsx
import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const StoryGenerator = ({ 
  loading, 
  error, 
  showRecoveryBanner
}) => {
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
          
          {/* Error message if any */}
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Recovery message */}
          {showRecoveryBanner && (
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-4">
              Your story generation is continuing after a page navigation. 
              Your parameters have been restored automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;