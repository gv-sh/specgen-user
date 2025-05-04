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

  const handleBackToLibrary = () => {
    setActiveStory(null);
    setGeneratedContent(null);
    // If using React Router, you might need:
    // navigate('/library', { replace: true });
  };

  // Determine which view to show
  const renderContent = () => {

    // Check the current path to determine if we're on the generating route
    const isGeneratingRoute = window.location.pathname === '/generating';

    // If we're generating a story
    if (isGeneratingRoute || (generationInProgress && !activeStory)) {
      return (
        <>
          <GenerationControls
            activeStory={null}
            generatedContent={null}
            onBackToLibrary={() => {
              if (!loading) {
                handleBackToLibrary();
              }
            }}
            storyTitle="Generating..."
          />
          <StoryGenerator
            loading={loading}
            error={error}
            showRecoveryBanner={showRecoveryBanner}
            onGenerationComplete={() => {
              // When generation is complete, don't navigate - just set state
              // The active story is already set in the hook
            }}
          />
        </>
      );
    }
    // Only show the generator UI when on the generating route OR explicitly generating
    if (isGeneratingRoute || (generationInProgress && loading && !activeStory && !generatedContent)) {
      return (
        <>
          <GenerationControls
            activeStory={activeStory}
            generatedContent={generatedContent}
            onBackToLibrary={handleBackToLibrary}
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
            onBackToLibrary={handleBackToLibrary}
            storyTitle={storyTitle}
          />
          <StoryViewer
            story={storyToView}
            onBackToLibrary={handleBackToLibrary}
            onRegenerateStory={handleGeneration}
            onCreateNew={handleCreateNew}
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
          highlightedStoryId={highlightedStoryId}
          loading={loading}
          error={error}
        />
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