// src/hooks/useGeneration.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { generateContent, fetchPreviousGenerations } from '../services/api';
import { generateRandomYear } from '../utils/parameterUtils';

export const useGeneration = (
  selectedParameters,
  setSelectedParameters,
  setGenerationInProgress
) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [storyTitle, setStoryTitle] = useState("Untitled Story");
  const [storyYear, setStoryYear] = useState(generateRandomYear());
  const [highlightedStoryId, setHighlightedStoryId] = useState(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [lastGeneratedStoryId, setLastGeneratedStoryId] = useState(null);

  // Ref to prevent double loading
  const storiesLoaded = useRef(false);

  // Load stories only once when component mounts
  useEffect(() => {
    if (!storiesLoaded.current) {
      loadStories();
      storiesLoaded.current = true;
    }
  }, []);

  // Load stories from API or local storage
  const loadStories = async () => {
    if (loading) return;
  
    setLoading(true);
    setError(null);
  
    try {
      // Try to fetch from API first
      const response = await fetchPreviousGenerations();
      
      if (response.success && response.data) {
        console.log(`Loaded ${response.data.length} stories from API`);
        setStories(response.data);
        setError(null);
        
        // Store only minimal data in cache to avoid quota issues
        try {
          // Limit to fewer stories and strip large data
          const minimalStories = response.data.slice(0, 5).map(story => ({
            id: story.id,
            title: story.title,
            createdAt: story.createdAt,
            year: story.year,
            // Exclude content and imageData which take up most space
            // Add a flag to indicate this is a minimal record
            isMinimal: true
          }));
          
          localStorage.setItem('specgen-cached-stories', JSON.stringify(minimalStories));
          localStorage.setItem('specgen-cached-timestamp', Date.now().toString());
        } catch (storageError) {
          console.warn('Unable to cache stories due to storage limits');
          // Clear other caches to make room
          localStorage.removeItem('specgen-history');
        }
      } else {
        throw new Error(response.error || 'Failed to load stories');
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      
      // Try to load minimal data from cache as fallback
      try {
        const cachedStoriesJSON = localStorage.getItem('specgen-cached-stories');
        if (cachedStoriesJSON) {
          const cachedStories = JSON.parse(cachedStoriesJSON);
          if (cachedStories && cachedStories.length > 0) {
            console.log('Using cached minimal story data');
            
            // If stories are minimal, add placeholder content
            const displayStories = cachedStories.map(story => {
              if (story.isMinimal) {
                return {
                  ...story,
                  content: "Content unavailable in offline mode. Please reconnect to view full content.",
                  imageData: null
                };
              }
              return story;
            });
            
            setStories(displayStories);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (cacheErr) {
        // If we can't even read from cache, we're in trouble
        console.error('Cache read error:', cacheErr);
      }
      
      setError('Failed to load your story library. Storage quota may be exceeded.');
    } finally {
      setLoading(false);
    }
  };

  // Single generation function
  const handleGeneration = useCallback(async (providedParameters = null) => {
    // Prevent multiple generations
    if (loading) return null;

    let newStoryId = null;

    // Reset states
    setError(null);
    setGeneratedContent(null);
    setLastGeneratedStoryId(null);

    // Use provided parameters or selected parameters
    const paramsToUse = providedParameters || selectedParameters;

    // Validate parameters
    if (!paramsToUse || paramsToUse.length === 0) {
      setError('Please select at least one parameter');
      return null;
    }

    // Check for parameters with missing values
    const missingValueParams = paramsToUse.filter(p => p.value === undefined || p.value === null);
    if (missingValueParams.length > 0) {
      setError(`Please set values for all selected parameters.`);
      return null;
    }

    try {
      setLoading(true);

      // Format parameters for API
      const parameterValues = {};
      paramsToUse.forEach(param => {
        if (!parameterValues[param.categoryId]) {
          parameterValues[param.categoryId] = {};
        }
        parameterValues[param.categoryId][param.id] = param.value;
      });

      // Make the API call
      const response = await generateContent(
        parameterValues,
        Object.keys(parameterValues),
        'combined',
        storyYear,
        null
      );

      // Handle successful generation
      if (response.success) {
        if (response.content) {
          setGeneratedContent(response.content);

          // Extract title
          let extractedTitle = "Untitled Story";
          const contentLines = response.content.split('\n');
          for (const line of contentLines) {
            if (line.trim().startsWith('**Title:')) {
              extractedTitle = line.trim().replace(/\*\*/g, '').replace('Title:', '').trim();
              break;
            }
          }
          setStoryTitle(response.title || extractedTitle);
        }

        // Create story object
        const newStory = response.generatedStory || {
          id: `story-${Date.now()}`,
          title: response.title || storyTitle || "Untitled Story",
          createdAt: new Date().toISOString(),
          content: response.content,
          imageData: response.imageData?.startsWith('data:image')
            ? response.imageData
            : response.imageData ? `data:image/png;base64,${response.imageData}` : null,
          parameterValues,
          metadata: response.metadata,
          year: response.year || storyYear
        };

        // Set the new story ID
        newStoryId = newStory.id;
        setLastGeneratedStoryId(newStoryId);

        // Update state with new story
        setActiveStory(newStory);

        // Update stories array and cache
        const updatedStories = [newStory, ...stories];
        setStories(updatedStories);
        localStorage.setItem('specgen-cached-stories', JSON.stringify(updatedStories));
        localStorage.setItem('specgen-cached-timestamp', Date.now().toString());

      } else {
        setError(response.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
      setGenerationInProgress(false);

      // Clear generation flags
      sessionStorage.removeItem('specgen-auto-generate');
      sessionStorage.removeItem('specgen-generating');

      return newStoryId;
    }
  }, [storyYear, storyTitle, selectedParameters, setGenerationInProgress, loading, stories]);

  // Controlled generation for the "generating" route
  useEffect(() => {
    // Only execute this logic on the specific generating route
    if (window.location.pathname !== '/generating') {
      return;
    }

    const autoGenerate = sessionStorage.getItem('specgen-auto-generate');
    const isGenerating = sessionStorage.getItem('specgen-generating');

    // Only generate if explicitly requested AND not already generating
    if (autoGenerate === 'true' && !isGenerating && !loading) {
      // Set generating flag
      sessionStorage.setItem('specgen-generating', 'true');

      try {
        // Get parameters from session storage
        const paramsString = sessionStorage.getItem('specgen-parameters');

        if (paramsString) {
          const parsedParams = JSON.parse(paramsString);

          // Get year
          const yearString = sessionStorage.getItem('specgen-story-year');
          if (yearString) {
            setStoryYear(parseInt(yearString, 10));
          }

          // Start generation
          if (parsedParams.length > 0) {
            setShowRecoveryBanner(true);
            setGenerationInProgress(true);
            handleGeneration(parsedParams);
          }
        }
      } catch (error) {
        console.error('Error during generation:', error);
        // Clear flags
        sessionStorage.removeItem('specgen-parameters');
        sessionStorage.removeItem('specgen-auto-generate');
        sessionStorage.removeItem('specgen-generating');
        setGenerationInProgress(false);
      }
    }
  }, [handleGeneration, loading, setGenerationInProgress]);

  return {
    loading,
    error,
    generatedContent,
    stories,
    setStories,
    activeStory,
    setActiveStory,
    storyTitle,
    storyYear,
    setStoryYear,
    highlightedStoryId,
    showRecoveryBanner,
    lastGeneratedStoryId,
    handleGeneration,
    loadStories
  };
};