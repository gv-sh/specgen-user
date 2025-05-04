// src/pages/Generation.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StoryLibrary from '../components/stories/StoryLibrary';
import StoryViewer from '../components/stories/StoryViewer';
import StoryGenerator from '../components/stories/StoryGenerator';
import GenerationControls from '../components/generation/GenerationControls';
import { useGeneration } from '../hooks/useGeneration';

// Separate view components
const GeneratingView = ({ loading, error, showRecoveryBanner, onGenerationComplete, handleBackToLibrary }) => (
  <>
    <GenerationControls
      activeStory={null}
      onBackToLibrary={handleBackToLibrary}
      storyTitle="Generating..."
    />
    <StoryGenerator
      loading={loading}
      error={error}
      showRecoveryBanner={showRecoveryBanner}
      onGenerationComplete={onGenerationComplete}
    />
  </>
);

const StoryView = ({ activeStory, generatedContent, storyTitle, handleBackToLibrary, handleGeneration, handleCreateNew, loading }) => (
  <>
    <GenerationControls
      activeStory={activeStory}
      generatedContent={generatedContent}
      onBackToLibrary={handleBackToLibrary}
      storyTitle={activeStory?.title || storyTitle}
    />
    <StoryViewer
      story={activeStory}
      onBackToLibrary={handleBackToLibrary}
      onRegenerateStory={handleGeneration}
      onCreateNew={handleCreateNew}
      loading={loading}
    />
  </>
);

const LibraryView = ({ stories, setActiveStory, handleCreateNew, highlightedStoryId, loading, error, storyTitle }) => (
  <>
    <GenerationControls
      onBackToLibrary={() => {}}
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

const Generation = ({
  setGeneratedContent,
  generatedContent,
  selectedParameters,
  setSelectedParameters,
  generationInProgress,
  setGenerationInProgress
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loading,
    error,
    stories,
    activeStory,
    setActiveStory,
    storyTitle,
    showRecoveryBanner,
    highlightedStoryId,
    handleGeneration
  } = useGeneration(
    selectedParameters,
    setSelectedParameters,
    setGenerationInProgress
  );

  const handleCreateNew = () => navigate('/parameters');
  
  const handleBackToLibrary = () => {
    setActiveStory(null);
    setGeneratedContent(null);
  };

  // Watch for generation completion
  useEffect(() => {
    // If we just completed generation and have an active story but still on generating route
    if (!loading && activeStory && location.pathname === '/generating') {
      // Navigate to library so we can see the story
      navigate('/library');
    }
  }, [loading, activeStory, location.pathname, navigate]);

  // Handle generation completion
  const onGenerationComplete = () => {
    setGenerationInProgress(false);
    // The navigate happens in the useEffect above when loading completes
  };

  // Determine which view to show
  const isGeneratingRoute = location.pathname === '/generating';

  if (isGeneratingRoute || generationInProgress) {
    return (
      <div className="bg-card rounded-md border shadow-sm h-full overflow-auto">
        <GeneratingView
          loading={loading}
          error={error}
          showRecoveryBanner={showRecoveryBanner}
          onGenerationComplete={onGenerationComplete}
          handleBackToLibrary={handleBackToLibrary}
        />
      </div>
    );
  }

  if (activeStory) {
    return (
      <div className="bg-card rounded-md border shadow-sm h-full overflow-auto">
        <StoryView
          activeStory={activeStory}
          generatedContent={generatedContent}
          storyTitle={storyTitle}
          handleBackToLibrary={handleBackToLibrary}
          handleGeneration={handleGeneration}
          handleCreateNew={handleCreateNew}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md border shadow-sm h-full overflow-auto">
      <LibraryView
        stories={stories}
        setActiveStory={setActiveStory}
        handleCreateNew={handleCreateNew}
        highlightedStoryId={highlightedStoryId}
        loading={loading}
        error={error}
        storyTitle={storyTitle}
      />
    </div>
  );
};

export default Generation;