// src/pages/Generation.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateContent, fetchPreviousGenerations } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  Download, 
  Share, 
  Pencil, 
  RefreshCw,
  PlusCircle,
  Calendar,
  ChevronLeft,
  Search,
  Filter,
  X,
  SortAsc,
  SortDesc,
  BookOpen,
  Home,
  ChevronRight,
  Trash2
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
  
  // State for library filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [allYears, setAllYears] = useState([]);
  
  // Extract all available years from the stories for filtering
  const extractAvailableYears = useCallback((storyList = []) => {
    const years = new Set();
    storyList.forEach(story => {
      if (story.year) {
        years.add(parseInt(story.year, 10));
      }
    });
    return [...years].sort((a, b) => a - b); // sort chronologically
  }, []);

  // Render breadcrumbs for better navigation
  const renderBreadcrumbs = () => {
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
                navigate('/');
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Button 
                variant="link" 
                className="ml-1 text-sm font-medium text-muted-foreground hover:text-foreground p-0 h-auto"
                onClick={() => {
                  setActiveStory(null);
                  setGeneratedContent(null);
                  navigate('/parameters');
                }}
              >
                Parameters
              </Button>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="ml-1 text-sm font-medium md:ml-2">
                {activeStory || generatedContent ? "View Story" : "Story Library"}
              </span>
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
        // Apply any active filters
        const filters = {
          year: yearFilter || undefined,
          search: searchQuery || undefined,
          sort: sortOrder
        };
        
        const response = await fetchPreviousGenerations(filters);
        
        if (response.success && response.data) {
          setStories(response.data);
          
          // Extract all available years for filter dropdown
          const years = extractAvailableYears(response.data);
          setAllYears(years);
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
  }, [location.search, sortOrder, extractAvailableYears, searchQuery, yearFilter]);

  // Handle search filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle clearing all filters
  const clearFilters = () => {
    setSearchQuery('');
    setYearFilter('');
  };

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
          title: response.title || storyTitle || "Untitled Story",
          createdAt: new Date().toISOString(),
          content: response.content,
          imageData: response.imageData ? `data:image/png;base64,${response.imageData}` : null,
          parameterValues,
          metadata: response.metadata,
          year: response.year || yearToUse
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
  }, [selectedParameters, validateParameters, storyYear, storyTitle]);

  // Handle deleting a story
  const handleDeleteStory = useCallback((storyId, event) => {
    // Prevent the click from bubbling up to the card and opening the story
    event?.stopPropagation();
    
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      try {
        // Get existing history
        const historyJSON = localStorage.getItem('specgen-history');
        let history = historyJSON ? JSON.parse(historyJSON) : [];
        
        // Find the story to delete
        const storyToDelete = history.find(story => story.id === storyId);
        
        // Filter out the story with the given ID
        const updatedHistory = history.filter(story => story.id !== storyId);
        
        // Save updated history back to localStorage
        localStorage.setItem('specgen-history', JSON.stringify(updatedHistory));
        
        // Update state
        setStories(updatedHistory);
        
        // If the active story was deleted, clear it
        if (activeStory && activeStory.id === storyId) {
          setActiveStory(null);
          setGeneratedContent(null);
        }
        
        // Show success message if needed
        console.log(`Story "${storyToDelete?.title || 'Unknown'}" deleted from library`);
      } catch (error) {
        console.error('Error deleting story:', error);
        setError('Failed to delete story. Please try again.');
      }
    }
  }, [activeStory]);

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
  
  // Filtered stories based on search and year filter
  const filteredStories = useMemo(() => {
    let filtered = [...stories];
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(story => 
        story.year === parseInt(yearFilter, 10) || 
        story.year?.toString() === yearFilter
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story => 
        story.title?.toLowerCase().includes(query) || 
        story.content?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [stories, yearFilter, searchQuery]);

  // Automatically trigger generation when shouldGenerate is true
  useEffect(() => {
    if (shouldGenerate && selectedParameters && selectedParameters.length > 0 && !loading) {
      handleGeneration();
    }
  }, [shouldGenerate, selectedParameters, handleGeneration, loading]);

  // Check if we just came from parameters page and should auto-generate
  useEffect(() => {
    if (selectedParameters && selectedParameters.length > 0 && !generatedContent && !activeStory && !loading) {
      handleGeneration();
    }
  }, [selectedParameters, generatedContent, activeStory, loading, handleGeneration]);

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
      {/* Breadcrumb navigation */}
      {renderBreadcrumbs()}
      
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
      
      {/* Display error if any */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
          {error}
        </div>
      )}
      
      {/* Filter and search bar */}
      {stories.length > 0 && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1 h-7 w-7 p-0"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Year filter */}
            <div className="relative">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 pr-9 text-sm"
              >
                <option value="">All Years</option>
                {allYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 pointer-events-none text-muted-foreground" />
            </div>
            
            {/* Sort order toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              title={sortOrder === 'newest' ? 'Showing newest first' : 'Showing oldest first'}
            >
              {sortOrder === 'newest' ? (
                <SortDesc className="h-4 w-4 mr-1" />
              ) : (
                <SortAsc className="h-4 w-4 mr-1" />
              )}
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
            
            {/* Clear filters button - only show if filters are active */}
            {(searchQuery || yearFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
      
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-25" />
          <h3 className="text-lg font-medium mb-2">No stories yet</h3>
          <p className="text-muted-foreground mb-6">Generate your first story to get started</p>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Story
          </Button>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-25" />
          <h3 className="text-lg font-medium mb-2">No matching stories</h3>
          <p className="text-muted-foreground mb-6">
            Try changing your search or filters
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <Card 
              key={story.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group"
              onClick={() => handleLoadStory(story)}
            >
              {/* Delete button (visible on hover) */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                onClick={(e) => handleDeleteStory(story.id, e)}
                title="Delete story"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
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
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {formatDate(story.createdAt)}
                  </div>
                  {story.year && (
                    <div className="px-2 py-0.5 bg-secondary rounded-full text-xs font-medium">
                      Year {story.year}
                    </div>
                  )}
                </div>
                
                {!story.imageData && story.content && (
                  <p className="text-muted-foreground line-clamp-3 mt-3">
                    {story.content.split('\n\n')[0].replace(/\*\*Title:.*?\*\*/g, '')}
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