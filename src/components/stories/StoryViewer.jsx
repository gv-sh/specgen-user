// src/components/stories/StoryViewer.jsx
import React from 'react';
import { Button } from '../ui/button';
import { 
  Calendar, 
  Download, 
  Share, 
  RefreshCw, 
  PlusCircle
} from 'lucide-react';
import { downloadTextFile } from '../../utils/exportUtils';

const StoryViewer = ({ 
  story, 
  onBackToLibrary, 
  onRegenerateStory, 
  onCreateNew, 
  loading
}) => {
  // Parse content into paragraphs
  const contentParagraphs = story.content ? 
    story.content.split('\n\n').filter(p => p.trim()) : [];
  
  // Format date
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
  
  // Get the image source
  const imageSource = getStoryImage(story);
  
  return (
    <div className="container max-w-6xl mx-auto h-full flex flex-col">
      {/* Header */}
      <header className="py-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{story.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Year {story.year}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRegenerateStory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateNew}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Story
            </Button>
          </div>
        </div>
      </header>
      
      <div className="py-8">
        <div className="prose prose-lg max-w-3xl mx-auto">
          {imageSource && (
            <div className="mb-8 not-prose">
              <img 
                src={imageSource} 
                alt={story.title} 
                className="w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  console.error("Story image failed to load:", imageSource);
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                }}
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
              onClick={() => downloadTextFile(story.content, `${story.title.replace(/\s+/g, '-').toLowerCase()}.txt`)}
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
          </div>
          
          {/* Collection info */}
          <div className="text-sm text-muted-foreground">
            <span>Generated on </span>
            <span>{formatDate(story.createdAt)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoryViewer;