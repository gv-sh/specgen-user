// src/components/stories/StoryLibrary.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  PlusCircle,
  Calendar,
  Search,
  Filter,
  X,
  SortAsc,
  SortDesc,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StoryLibrary = ({ 
  stories, 
  onStorySelect, 
  onCreateNew, 
  onDeleteStory, 
  highlightedStoryId,
  loading,
  error
}) => {
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [allYears, setAllYears] = useState([]);
  
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
  
  // Extract all available years from the stories for filtering
  const extractAvailableYears = (storyList = []) => {
    const years = new Set();
    storyList.forEach(story => {
      if (story.year) {
        years.add(parseInt(story.year, 10));
      }
    });
    return [...years].sort((a, b) => a - b); // sort chronologically
  };
  
  // Get story image with proper formatting - ensuring we handle all image formats correctly
  const getStoryImage = (story) => {
    if (!story) return null;
    
    // Handle base64 image data that's already properly formatted
    if (story.imageData && typeof story.imageData === 'string') {
      if (story.imageData.startsWith('data:image')) {
        return story.imageData;
      } else {
        // Handle raw base64 data without the prefix
        return `data:image/png;base64,${story.imageData}`;
      }
    }
    
    return null;
  };
  
  // Handle title extraction from story
  const getStoryTitle = (story) => {
    if (!story) return "Untitled Story";
    
    // Use title if available
    if (story.title && story.title !== "Untitled Story") {
      return story.title;
    }
    
    // Try to extract title from content
    if (story.content) {
      const contentLines = story.content.split('\n');
      for (const line of contentLines) {
        if (line.trim().startsWith('**Title:')) {
          const extractedTitle = line.trim().replace(/\*\*/g, '').replace('Title:', '').trim();
          if (extractedTitle) return extractedTitle;
        }
      }
    }
    
    return "Untitled Story";
  };
  
  // Handle search filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle clearing all filters
  const clearFilters = () => {
    setSearchQuery('');
    setYearFilter('');
  };
  
  // Effect to set available years when stories change
  useEffect(() => {
    const years = extractAvailableYears(stories);
    setAllYears(years);
  }, [stories]);
  
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
    
    // Apply sort order
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    
    return filtered;
  }, [stories, yearFilter, searchQuery, sortOrder]);

  return (
    <div className="container max-w-6xl mx-auto p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Stories</h1>
          <p className="text-muted-foreground">Collection of your generated speculative fiction</p>
        </div>
        
        <Button 
          onClick={onCreateNew}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Story
        </Button>
      </div>
      
      {/* Display error if any */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
      
      {/* Empty state */}
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-25" />
          <h3 className="text-lg font-medium mb-2">No stories yet</h3>
          <p className="text-muted-foreground mb-6">Generate your first story to get started</p>
          <Button onClick={onCreateNew}>
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
              className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group ${highlightedStoryId === story.id ? 'ring-2 ring-primary animate-pulse' : ''}`}
              onClick={() => onStorySelect(story)}
            >
              {/* No delete button - removed as requested */}
              
              {story.imageData && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={getStoryImage(story)} 
                    alt={getStoryTitle(story)} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              
              <CardContent className="p-5">
                <h3 className="text-xl font-semibold line-clamp-2 mb-2">{getStoryTitle(story)}</h3>
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

export default StoryLibrary;