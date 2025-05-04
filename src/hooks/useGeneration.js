// src/hooks/useGeneration.js
import { useState, useCallback, useEffect } from 'react';
import { generateContent, fetchPreviousGenerations } from '../services/api';
import { generateRandomYear } from '../utils/parameterUtils';

export const useGeneration = (
  selectedParameters,
  setSelectedParameters,
  setGenerationInProgress
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
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

  // Load stories
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
  }, []);

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
        
        // Add to stories and reload from localStorage
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
        setError(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(err.message || 'Failed to generate content. Please try again.');
      }
    } finally {
      setLoading(false);
      setShouldGenerate(false); // Reset the flag
      setGenerationInProgress(false);
      return newStoryId;
    }
  }, [storyYear, storyTitle, selectedParameters, setGenerationInProgress]);

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
        
        // Check if we need to restore parameters
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
  }, [recoveryAttempted, activeStory, generatedContent, loading, selectedParameters, setSelectedParameters, setGenerationInProgress, handleGeneration]);

  return {
    loading,
    error,
    generatedContent,
    generatedImage,
    metadata,
    stories,
    setStories,
    activeStory,
    setActiveStory,
    storyTitle,
    storyYear,
    showRecoveryBanner,
    highlightedStoryId,
    setShouldGenerate,
    handleGeneration,
    currentGeneratedStory: generatedContent ? {
      id: 'current-generation',
      title: storyTitle || "Untitled Story",
      content: generatedContent || "",
      imageData: generatedImage || null,
      createdAt: new Date().toISOString(),
      year: storyYear || generateRandomYear(),
      metadata: metadata || {}
    } : null
  };
};