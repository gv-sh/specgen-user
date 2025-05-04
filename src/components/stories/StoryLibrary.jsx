// src/components/stories/StoryLibrary.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import StoryCard from './StoryCard';
import StoryFilters from './StoryFilters';
import { EmptyLibrary, NoSearchResults } from './EmptyStates';

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
  const [sortOrder, setSortOrder] = useState('newest');
  const [allYears, setAllYears] = useState([]);
  
  // Handle search filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle clearing all filters
  const clearFilters = () => {
    setSearchQuery('');
    setYearFilter('');
  };
  
  // Extract years from stories
  useEffect(() => {
    const years = new Set();
    stories?.forEach(story => {
      if (story.year) {
        years.add(parseInt(story.year, 10));
      }
    });
    setAllYears([...years].sort((a, b) => a - b));
  }, [stories]);
  
  // Filtered stories based on search and year filter
  const filteredStories = useMemo(() => {
    let filtered = [...(stories || [])];
    
    if (yearFilter) {
      filtered = filtered.filter(story => 
        story.year === parseInt(yearFilter, 10) || 
        story.year?.toString() === yearFilter
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story => 
        story.title?.toLowerCase().includes(query) || 
        story.content?.toLowerCase().includes(query)
      );
    }
    
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    
    return filtered;
  }, [stories, yearFilter, searchQuery, sortOrder]);

  return (
    <div className="container max-w-6xl mx-auto p-6">
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
      
      {/* Loading indicator for stories */}
      {loading && !stories?.length && (
        <div className="my-8">
          <p className="text-center text-sm text-muted-foreground mb-2">Loading your stories...</p>
          <div className="w-full bg-muted rounded-full h-2 mb-4 mx-auto max-w-md">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
      
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {stories && stories.length > 0 && (
        <StoryFilters
          searchQuery={searchQuery}
          yearFilter={yearFilter}
          sortOrder={sortOrder}
          allYears={allYears}
          onSearchChange={handleSearchChange}
          onYearFilterChange={setYearFilter}
          onSortOrderChange={setSortOrder}
          onClearFilters={clearFilters}
        />
      )}
      
      {!loading && (!stories || stories.length === 0) ? (
        <EmptyLibrary onCreateNew={onCreateNew} />
      ) : !loading && filteredStories.length === 0 ? (
        <NoSearchResults onClearFilters={clearFilters} />
      ) : !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard 
              key={story.id}
              story={story}
              isHighlighted={highlightedStoryId === story.id}
              onClick={() => onStorySelect(story)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryLibrary;