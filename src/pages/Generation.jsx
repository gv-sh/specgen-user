// src/pages/Generation.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateContent, fetchPreviousGenerations } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

// Import the new components
import StoryLibrary from '../components/stories/StoryLibrary';
import StoryViewer from '../components/stories/StoryViewer';
import StoryGenerator from '../components/stories/StoryGenerator';

// Generate a random year between 2050 and 2150
const generateRandomYear = () => {
  return Math.floor(Math.random() * (2150 - 2050 + 1)) + 2050;
};

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
  
  // State for managing story generation and viewing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [storyTitle, setStoryTitle] = useState("Untitled Story");
  const [storyYear, setStoryYear] = useState(generateRandomYear().toString());
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [highlightedStoryId, setHighlightedStoryId] = useState(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  const handleDeleteStory = (storyId) => {
    setStories(prevStories => prevStories.filter(story => story.id !== storyId));
  };
  
  // Render breadcrumbs for better navigation
  const renderBreadcrumbs = () => {
    // If we're viewing a story
    if (activeStory || generatedContent) {
      return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Button 
                variant="link" 
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground p-0 h-auto"
                onClick={() => {
                  setActiveStory(null);
                  setGeneratedContent(null);
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Story Library
              </Button>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="ml-1 text-sm font-medium text-foreground md:ml-2">
                  {activeStory?.title || storyTitle || "View Story"}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      );
    }
    
    // If we're at the library page
    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Story Library</span>
            </div>
          </li>
        </ol>
      </nav>
    );
  };
  
  // Fetch stories on component mount
  useEffect(() => {
    const loadStories = async () => {
      try {
        const response = await fetchPreviousGenerations();
        
        if (response.success && response.data) {
          setStories(response.data);
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load your story library');
      }
    };
    
    loadStories();
    
    // Check if we should generate content based on URL query params
    const queryParams = new URLSearchParams(location.search);
    const autoGenerate = queryParams.get('generate');
    if (autoGenerate === 'true') {
      setShouldGenerate(true);
    }
    
    // Check if a year was passed via sessionStorage
    const savedYear = sessionStorage.getItem('specgen-story-year');
    if (savedYear) {
      setStoryYear(savedYear);
      // Clear it after using
      sessionStorage.removeItem('specgen-story-year');
    }
  }, [location.search]);

  // No delete functionality as requested

  // Validate parameters before generation
  const validateParameters = useCallback(() => {
    if (!selectedParameters || selectedParameters.length === 0) {
      setError('Please select at least one parameter');
      return false;
    }

    const missingValueParams = selectedParameters.filter(
      param => param.value === undefined || param.value === null
    );

    if (missingValueParams.length > 0) {
      setError(`Please set values for all selected parameters.`);
      return false;
    }

    return true;
  }, [selectedParameters]);

  // Handle generation
  const handleGeneration = useCallback(async (providedParameters = null) => {
    let newStoryId = null;
    // Reset previous states
    setError(null);
    setGeneratedContent(null);
    setGeneratedImage('');
    setMetadata(null);
    setActiveStory(null);
    
    // Use provided parameters or selected parameters
    const paramsToUse = providedParameters || selectedParameters;
    
    // Use the current storyYear or generate a new random year if none exists
    let yearToUse;
    if (storyYear && storyYear.trim() !== '') {
      yearToUse = parseInt(storyYear, 10);
      if (isNaN(yearToUse)) {
        yearToUse = generateRandomYear();
      }
    } else {
      yearToUse = generateRandomYear();
    }
    setStoryYear(yearToUse.toString());

    // Validate parameters
    if (!paramsToUse || paramsToUse.length === 0) {
      setError('Please select at least one parameter');
      return;
    }

    const missingValueParams = paramsToUse.filter(
      param => param.value === undefined || param.value === null
    );

    if (missingValueParams.length > 0) {
      setError(`Please set values for all selected parameters.`);
      return;
    }

    try {
      setLoading(true);

      // Prepare parameters for API
      const parameterValues = {};
      
      // Group parameters by category
      paramsToUse.forEach(param => {
        if (!parameterValues[param.categoryId]) {
          parameterValues[param.categoryId] = {};
        }
        
        parameterValues[param.categoryId][param.id] = param.value;
      });

      // Call generation API with year parameter
      const response = await generateContent(
        parameterValues, 
        Object.keys(parameterValues), 
        'combined', // Default to combined for both fiction and image
        yearToUse,  // Pass the year parameter
        null        // No custom title for now
      );

      // Handle successful generation
      if (response.success) {
        // Set generated content
        if (response.content) {
          setGeneratedContent(response.content);
          
          // Extract title from content or use default
          let extractedTitle = "Untitled Story";
          const contentLines = response.content.split('\n');
          for (const line of contentLines) {
            if (line.trim().startsWith('**Title:')) {
              extractedTitle = line.trim().replace(/\*\*/g, '').replace('Title:', '').trim();
              break;
            }
          }
          // Use title from response if available, otherwise use extracted title
          const finalTitle = response.title || extractedTitle;
          setStoryTitle(finalTitle);
        }

        // Set generated image with proper formatting
        if (response.imageData) {
          setGeneratedImage(`data:image/png;base64,${response.imageData}`);
        }

        // Set metadata
        if (response.metadata) {
          setMetadata(response.metadata);
        }
        
        // Use the story object returned from the API
        const newStory = response.generatedStory || {
          id: `story-${Date.now()}`,
          title: response.title || storyTitle || "Untitled Story",
          createdAt: new Date().toISOString(),
          content: response.content,
          imageData: response.imageData ? `data:image/png;base64,${response.imageData}` : null,
          parameterValues,
          metadata: response.metadata,
          year: response.year || yearToUse
        };
        
        // Add to stories and reload from localStorage to ensure consistency
        setTimeout(() => {
          fetchPreviousGenerations().then(result => {
            if (result.success) {
              setStories(result.data);
            }
          });
        }, 500);
        
        setActiveStory(newStory);
        
        // Return the ID of the new story for highlighting
        newStoryId = newStory.id;
      } else {
        // Handle API-level errors
        setError(response.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error:', err);
      
      // Handle different error types
      if (err.response) {
        // The request was made and the server responded with an error status
        setError(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something else caused the error
        setError(err.message || 'Failed to generate content. Please try again.');
      }
    } finally {
      setLoading(false);
      setShouldGenerate(false); // Reset the flag
      setGenerationInProgress(false);
      return newStoryId;
    }
  }, [storyYear, storyTitle, selectedParameters, setGenerationInProgress]);

  // Navigate to parameters page to create a new story
  const handleCreateNew = () => {
    navigate('/parameters');
  };

  // Automatically trigger generation when shouldGenerate is true
  useEffect(() => {
    if (shouldGenerate && selectedParameters && selectedParameters.length > 0 && !loading) {
      handleGeneration().then(newStoryId => {
        if (newStoryId) {
          setHighlightedStoryId(newStoryId);
          // Clear highlight after 3 seconds
          setTimeout(() => setHighlightedStoryId(null), 3000);
        }
      });
    }
  }, [shouldGenerate, selectedParameters, handleGeneration, loading]);

  // Handle generation recovery from accidental page navigation
  useEffect(() => {
    // Don't attempt recovery if we've already tried or if we have content
    if (recoveryAttempted || activeStory || generatedContent) {
      return;
    }

    // Check if we have saved parameters to recover generation
    const savedParams = sessionStorage.getItem('specgen-parameters');
    const autoGenerate = sessionStorage.getItem('specgen-auto-generate');
    
    if (savedParams && autoGenerate === 'true' && !loading) {
      try {
        // Parse the parameters
        const parsedParams = JSON.parse(savedParams);
        
        // Check if we need to restore parameters to the parent component
        if (selectedParameters.length === 0 && parsedParams.length > 0) {
          setSelectedParameters(parsedParams);
          setShowRecoveryBanner(true);
        }
        
        // Trigger generation with the recovered parameters
        if (!loading && !generatedContent && parsedParams.length > 0) {
          // Clear the auto-generate flag
          sessionStorage.removeItem('specgen-auto-generate');
          // Inform user we're resuming their generation
          setLoading(true);
          // Use the parsed parameters
          handleGeneration(parsedParams).then(() => {
            setShowRecoveryBanner(false);
            setGenerationInProgress(false);
          });
        }
      } catch (error) {
        console.error('Error recovering parameters:', error);
        // Clear the flags to prevent repeated errors
        sessionStorage.removeItem('specgen-parameters');
        sessionStorage.removeItem('specgen-auto-generate');
      }
    }
    
    // Mark recovery as attempted
    setRecoveryAttempted(true);
  }, [recoveryAttempted, activeStory, generatedContent, loading, selectedParameters, setSelectedParameters, generationInProgress, setGenerationInProgress, handleGeneration]);

  // Create a combined story object for the currently generated content
  const currentGeneratedStory = generatedContent ? {
    id: 'current-generation',
    title: storyTitle || "Untitled Story",
    content: generatedContent || "",
    imageData: generatedImage || null,
    createdAt: new Date().toISOString(),
    year: storyYear || generateRandomYear(),
    metadata: metadata || {}
  } : null;

  // Determine which view to show
  const renderContent = () => {
    // If we're loading and have no content yet
    if (loading && !activeStory && !generatedContent) {
      return (
        <>
          {renderBreadcrumbs()}
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
          {renderBreadcrumbs()}
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
        {renderBreadcrumbs()}
        <StoryLibrary
          stories={stories}
          onStorySelect={setActiveStory}
          onCreateNew={handleCreateNew}
          onDeleteStory={handleDeleteStory}
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