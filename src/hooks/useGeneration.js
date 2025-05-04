// src/hooks/useGeneration.js
import { useState, useCallback, useEffect } from 'react';
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
  
  // Load stories only once when component mounts
  useEffect(() => {
    loadStories();
  }, []);
  
  // Load stories function
  const loadStories = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetchPreviousGenerations();
      if (response.success && response.data) {
        console.log(`Loaded ${response.data.length} stories`);
        setStories(response.data);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load your story library');
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
        
        // Update state with new story
        setActiveStory(newStory);
        newStoryId = newStory.id;
        
        // Refresh stories list
        setTimeout(loadStories, 500);
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
  }, [storyYear, storyTitle, selectedParameters, setGenerationInProgress, loading]);

  // Controlled generation for the "generating" route
  useEffect(() => {
    // Only run this if we're on the generating route and there's a pending generation
    if (window.location.pathname !== '/generating') return;
    
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
    handleGeneration,
    loadStories
  };
};