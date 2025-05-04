// src/components/stories/StoryCard.jsx
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

const StoryCard = ({ story, isHighlighted, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get story image with proper formatting
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

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group",
        isHighlighted ? 'ring-2 ring-primary animate-pulse' : ''
      )}
      onClick={onClick}
    >
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
  );
};

export default StoryCard;