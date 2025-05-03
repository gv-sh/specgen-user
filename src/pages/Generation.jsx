// src/pages/Generation.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateContent, fetchPreviousGenerations } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Download, 
  Share, 
  Pencil, 
  RefreshCw,
  PlusCircle,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { copyToClipboard, downloadTextFile, downloadImage } from '../utils/exportUtils';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

// Generate a random year between 2050 and 2150
const generateRandomYear = () => {
  return Math.floor(Math.random() * (2150 - 2050 + 1)) + 2050;
};

const Generation = ({ 
  setGeneratedContent, 
  generatedContent, 
  selectedParameters,
  onBackToHome 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [storyTitle, setStoryTitle] = useState("Untitled Story");
  const [storyYear, setStoryYear] = useState(generateRandomYear().toString());
  const [shouldGenerate, setShouldGenerate] = useState(false);
  
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
      }
    };
    
    loadStories();
    
    // Check if we should generate content based on URL query params
    const queryParams = new URLSearchParams(location.search);
    const autoGenerate = queryParams.get('generate');
    if (autoGenerate === 'true') {
      setShouldGenerate(true);
    }
  }, [location.search]);

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
  const handleGeneration = useCallback(async () => {
    // Reset previous states
    setError(null);
    setGeneratedContent(null);
    setGeneratedImage('');
    setMetadata(null);
    setActiveStory(null);
    
    // Generate a new random year for this generation
    const randomYear = generateRandomYear();
    setStoryYear(randomYear.toString());

    // Validate parameters
    if (!validateParameters()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare parameters for API
      const parameterValues = {};
      
      // Group parameters by category
      selectedParameters.forEach(param => {
        if (!parameterValues[param.categoryId]) {
          parameterValues[param.categoryId] = {};
        }
        
        parameterValues[param.categoryId][param.id] = param.value;
      });

      // Call generation API
      const response = await generateContent(
        parameterValues, 
        Object.keys(parameterValues), 
        'combined' // Default to combined for both fiction and image
      );

      // Handle successful generation
      if (response.success) {
        // Set generated content
        if (response.content) {
          setGeneratedContent(response.content);
          
          // Extract title from content or use default
          let title = "Untitled Story";
          const contentLines = response.content.split('\n');
          for (const line of contentLines) {
            if (line.trim().startsWith('**Title:')) {
              title = line.trim().replace(/\*\*/g, '').replace('Title:', '').trim();
              break;
            }
          }
          setStoryTitle(title);
        }

        // Set generated image
        if (response.imageData) {
          setGeneratedImage(`data:image/png;base64,${response.imageData}`);
        }

        // Set metadata
        if (response.metadata) {
          setMetadata(response.metadata);
        }
        
        // Add to stories
        const newStory = {
          id: `story-${Date.now()}`,
          title: title || "Untitled Story",
          createdAt: new Date().toISOString(),
          content: response.content,
          imageData: response.imageData ? `data:image/png;base64,${response.imageData}` : null,
          parameterValues,
          metadata: response.metadata,
          year: randomYear
        };
        
        setStories(prev => [newStory, ...prev]);
      } else {
        // Handle API-level errors
        setError(response.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setShouldGenerate(false); // Reset the flag
    }
  }, [selectedParameters, validateParameters]);

  // Format date for stories
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Load a story
  const handleLoadStory = (story) => {
    setActiveStory(story);
    
    // Set title from the selected story
    if (story.title) {
      setStoryTitle(story.title);
    }
    
    // Set year from the story
    if (story.year) {
      setStoryYear(story.year.toString());
    } else {
      setStoryYear(generateRandomYear().toString());
    }
  };

  // Handle back to parameters with auto-generation flag
  const handleCreateNew = () => {
    navigate('/parameters?returnToGenerate=true');
  };

  // Automatically trigger generation when shouldGenerate is true
  useEffect(() => {
    if (shouldGenerate && selectedParameters.length > 0 && !loading) {
      handleGeneration();
    }
  }, [shouldGenerate, selectedParameters, handleGeneration, loading]);

  // Check if we just came from parameters page and should auto-generate
  useEffect(() => {
    if (selectedParameters && selectedParameters.length > 0 && !generatedContent && !activeStory && !loading) {
      handleGeneration();
    }
  }, []);

  // Determine what content to display
  const displayContent = activeStory ? activeStory.content : generatedContent;
  const displayImage = activeStory ? activeStory.imageData : generatedImage;
  const displayTitle = activeStory && activeStory.title ? 
    activeStory.title : storyTitle;
  const displayYear = activeStory && activeStory.year ? 
    activeStory.year.toString() : storyYear;
  const displayDate = activeStory ? formatDate(activeStory.createdAt) : formatDate(new Date());

  // Parse content into paragraphs
  const contentParagraphs = displayContent ? displayContent.split('\n\n').filter(p => p.trim()) : [];

  // If we're in loading state and have no content yet
  if (loading && !displayContent) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Generating your story</h3>
          <p className="text-muted-foreground">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  // If we have a story to display
  if (displayContent) {
    return (
      <div className="container max-w-6xl mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="py-6 border-b">
          <Button 
            variant="ghost" 
            onClick={() => {
              setActiveStory(null);
              setGeneratedContent(null);
            }}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to library
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{displayTitle}</h1>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{displayDate}</span>
                <span className="mx-2">•</span>
                <span>Year {displayYear}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGeneration}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNew}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Story
              </Button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto py-8">
          <div className="prose prose-lg max-w-3xl mx-auto">
            {displayImage && (
              <div className="mb-8 not-prose">
                <img 
                  src={displayImage} 
                  alt={displayTitle} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
              </div>
            )}
            
            {contentParagraphs.map((paragraph, index) => {
              // Skip title paragraphs
              if (paragraph.includes('**Title:')) {
                return null;
              }
              return (
                <p key={index}>{paragraph}</p>
              );
            })}
          </div>
        </div>
        
        {/* Footer with actions */}
        <footer className="py-6 border-t mt-auto">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => downloadTextFile(displayContent, `${displayTitle.replace(/\s+/g, '-').toLowerCase()}.txt`)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBackToHome}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            {/* Collection info */}
            <div className="text-sm text-muted-foreground">
              <span>From Anantabhavi •</span>
              <span className="text-primary ml-1">Speculative Fiction</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }
  
  // Library view (no specific story selected or being generated)
  return (
    <div className="container max-w-6xl mx-auto p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Stories</h1>
          <p className="text-muted-foreground">Collection of your generated speculative fiction</p>
        </div>
        
        <Button 
          onClick={handleCreateNew}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Story
        </Button>
      </div>
      
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-medium mb-2">No stories yet</h3>
          <p className="text-muted-foreground mb-6">Generate your first story to get started</p>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Story
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card 
              key={story.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleLoadStory(story)}
            >
              {story.imageData && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={story.imageData} 
                    alt={story.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              
              <CardContent className="p-5">
                <h3 className="text-xl font-semibold line-clamp-2 mb-2">{story.title}</h3>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {formatDate(story.createdAt)}
                </div>
                
                {!story.imageData && (
                  <p className="text-muted-foreground line-clamp-3 mt-3">
                    {story.content.split('\n\n')[0]}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Generation;