// src/components/stories/StoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

const StoryCard = ({ story, isHighlighted, onClick }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Enhanced image handling function
  const getStoryImage = (story) => {
    if (!story) return null;
    
    // Handle base64 image data
    if (story.imageData) {
      if (typeof story.imageData === 'string') {
        // If it already starts with data:image, it's already properly formatted
        if (story.imageData.startsWith('data:image')) {
          return story.imageData;
        } 
        // Otherwise, assume it's raw base64 and add proper prefix
        return `data:image/png;base64,${story.imageData}`;
      }
    }
    
    // Handle image URL if that's what the API returns
    if (story.imageUrl) {
      return story.imageUrl;
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
  
  // Handle click with custom handler or default navigation
  const handleClick = () => {
    if (onClick) {
      onClick(story);
    } else {
      navigate(`/story?id=${story.id}`);
    }
  };
  
  // Get image source
  const imageSource = getStoryImage(story);

  return (
    <Card 
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group",
        isHighlighted ? 'ring-2 ring-primary animate-pulse' : ''
      )}
      onClick={handleClick}
    >
      {imageSource && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={imageSource} 
            alt={getStoryTitle(story)} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              console.error("Image failed to load:", imageSource);
              e.target.onerror = null; 
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
            }}
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
        
        {!imageSource && story.content && (
          <p className="text-muted-foreground line-clamp-3 mt-3">
            {story.content.split('\n\n')[0].replace(/\*\*Title:.*?\*\*/g, '')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryCard;