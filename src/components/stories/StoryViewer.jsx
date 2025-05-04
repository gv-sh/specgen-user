// src/components/stories/StoryViewer.jsx
import React from 'react';
import { Button } from '../ui/button';
import { 
  Calendar, 
  Download, 
  Share, 
  Pencil, 
  RefreshCw, 
  PlusCircle
} from 'lucide-react';
import { downloadTextFile } from '../../utils/exportUtils';

const StoryViewer = ({ 
  story, 
  onBackToLibrary, 
  onRegenerateStory, 
  onCreateNew, 
  onEditStory,
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
  
  return (
    <div className="container max-w-6xl mx-auto h-full flex flex-col">
      {/* Header */}
      <header className="py-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{story.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(story.createdAt)}</span>
              <span className="mx-2">•</span>
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
          {story.imageData && (
            <div className="mb-8 not-prose">
              <img 
                src={story.imageData} 
                alt={story.title} 
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
            <span>From Anantabhavi •</span>
            <span className="text-primary ml-1">Speculative Fiction</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoryViewer;