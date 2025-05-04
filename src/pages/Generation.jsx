// src/pages/Generation.jsx
import React from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import the new components
import StoryLibrary from '../components/stories/StoryLibrary';
import StoryViewer from '../components/stories/StoryViewer';
import StoryGenerator from '../components/stories/StoryGenerator';
import GenerationControls from '../components/generation/GenerationControls';
import { useGeneration } from '../hooks/useGeneration';

const Generation = ({ 
  setGeneratedContent, 
  generatedContent, 
  selectedParameters, 
  setSelectedParameters,
  generationInProgress,
  setGenerationInProgress,
  onBackToHome 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the extracted generation hook
  const {
    loading,
    error,
    stories,
    activeStory,
    setActiveStory,
    storyTitle,
    showRecoveryBanner,
    highlightedStoryId,
    handleGeneration,
    currentGeneratedStory
  } = useGeneration(
    selectedParameters,
    setSelectedParameters,
    setGenerationInProgress
  );

  // Navigate to parameters page to create a new story
  const handleCreateNew = () => {
    navigate('/parameters');
  };

  // Determine which view to show
  const renderContent = () => {
    // If we're loading and have no content yet
    if (loading && !activeStory && !generatedContent) {
      return (
        <>
          <GenerationControls 
            activeStory={activeStory}
            generatedContent={generatedContent}
            onBackToLibrary={() => setActiveStory(null)}
            storyTitle={storyTitle}
          />
          <StoryGenerator 
            loading={loading} 
            error={error}
            showRecoveryBanner={showRecoveryBanner}
          />
        </>
      );
    }
    
    // If we're viewing a story
    if (activeStory || currentGeneratedStory) {
      const storyToView = activeStory || currentGeneratedStory;
      return (
        <>
          <GenerationControls 
            activeStory={activeStory}
            generatedContent={generatedContent}
            onBackToLibrary={() => {
              setActiveStory(null);
              setGeneratedContent(null);
            }}
            storyTitle={storyTitle}
          />
          <StoryViewer
            story={storyToView}
            onBackToLibrary={() => {
              setActiveStory(null);
              setGeneratedContent(null);
            }}
            onRegenerateStory={handleGeneration}
            onCreateNew={handleCreateNew}
            onEditStory={onBackToHome}
            loading={loading}
          />
        </>
      );
    }
    
    // Default: show the library
    return (
      <>
        <GenerationControls 
          activeStory={activeStory}
          generatedContent={generatedContent}
          onBackToLibrary={() => setActiveStory(null)}
          storyTitle={storyTitle}
        />
        <StoryLibrary
          stories={stories}
          onStorySelect={setActiveStory}
          onCreateNew={handleCreateNew}
          onDeleteStory={() => {}} // Empty function as delete is removed
          highlightedStoryId={highlightedStoryId}
          loading={loading}
          error={error}
        />
        
        {/* Recovery Banner */}
        {showRecoveryBanner && (
          <Alert className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Resuming your story generation. Your parameters have been restored.
            </AlertDescription>
          </Alert>
        )}
      </>
    );
  };

  return (
    <div className="bg-card rounded-md border shadow-sm h-full overflow-auto">
      {renderContent()}
    </div>
  );
};

export default Generation;