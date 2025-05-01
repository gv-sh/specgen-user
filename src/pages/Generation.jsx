// src/pages/Generation.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateContent, fetchPreviousGenerations } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Copy, 
  Download, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  RefreshCw,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { copyToClipboard, downloadTextFile, downloadImage } from '../utils/exportUtils';
import { cn } from '../lib/utils';

const Generation = ({ 
  setGeneratedContent, 
  generatedContent, 
  selectedParameters,
  onBackToHome 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [copied, setCopied] = useState(false);
  const [previousGenerations, setPreviousGenerations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeGeneration, setActiveGeneration] = useState(null);
  
  // Fetch previous generations on component mount
  useEffect(() => {
    const loadPreviousGenerations = async () => {
      try {
        const response = await fetchPreviousGenerations();
        if (response.success && response.data) {
          setPreviousGenerations(response.data);
        }
      } catch (err) {
        console.error('Error fetching previous generations:', err);
      }
    };
    
    loadPreviousGenerations();
  }, []);

  // Validate parameters before generation
  const validateParameters = useCallback(() => {
    // Check if parameters are selected
    if (!selectedParameters || selectedParameters.length === 0) {
      setError('Please select at least one parameter');
      return false;
    }

    // Check if all parameters have values
    const missingValueParams = selectedParameters.filter(
      param => param.value === undefined || param.value === null
    );

    if (missingValueParams.length > 0) {
      setError(`Please set values for all selected parameters. 
        Missing values for: ${missingValueParams.map(p => p.name).join(', ')}`);
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
    setActiveGeneration(null);

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
        }

        // Set generated image
        if (response.imageData) {
          setGeneratedImage(`data:image/png;base64,${response.imageData}`);
        }

        // Set metadata
        if (response.metadata) {
          setMetadata(response.metadata);
        }
        
        // Add to previous generations (in a real app, this would come from the backend)
        const newGeneration = {
          id: `gen-${Date.now()}`,
          title: generateTitle(response.content),
          createdAt: new Date().toISOString(),
          content: response.content,
          imageData: response.imageData ? `data:image/png;base64,${response.imageData}` : null,
          parameterValues,
          metadata: response.metadata
        };
        
        setPreviousGenerations(prev => [newGeneration, ...prev]);
      } else {
        // Handle API-level errors
        setError(response.error || 'Generation failed');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedParameters, setGeneratedContent, validateParameters]);

  // Generate a title from content
  const generateTitle = (content) => {
    if (!content) return 'New Generation';
    
    // Take first sentence or first 40 characters
    const firstSentence = content.split(/[.!?]|\n/)[0].trim();
    if (firstSentence.length <= 40) {
      return firstSentence;
    }
    
    return firstSentence.substring(0, 37) + '...';
  };

  // Handle copying text
  const handleCopyText = async () => {
    const textToCopy = activeGeneration ? activeGeneration.content : generatedContent;
    if (!textToCopy) return;
    
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Handle downloading text
  const handleDownloadText = () => {
    const textToDownload = activeGeneration ? activeGeneration.content : generatedContent;
    if (!textToDownload) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `story-${timestamp}.txt`;
    downloadTextFile(textToDownload, filename);
  };

  // Handle downloading image
  const handleDownloadImage = () => {
    const imageToDownload = activeGeneration ? activeGeneration.imageData : generatedImage;
    if (!imageToDownload) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `image-${timestamp}.png`;
    downloadImage(imageToDownload, filename);
  };
  
  // Load a previous generation
  const handleLoadPreviousGeneration = (generation) => {
    setActiveGeneration(generation);
    setGeneratedContent(null);
    setGeneratedImage('');
    setMetadata(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Automatically generate content when the page loads
  useEffect(() => {
    if (selectedParameters.length > 0 && !generatedContent && !loading && !activeGeneration) {
      handleGeneration();
    }
  }, [generatedContent, handleGeneration, loading, selectedParameters, activeGeneration]);

  // Determine what content to display
  const displayContent = activeGeneration ? activeGeneration.content : generatedContent;
  const displayImage = activeGeneration ? activeGeneration.imageData : generatedImage;
  const displayMetadata = activeGeneration ? activeGeneration.metadata : metadata;

  return (
    <div className="flex h-full">
      {/* Sidebar for previous generations */}
      <div 
        className={cn(
          "border-r border-border transition-all duration-300 ease-in-out bg-card/50 flex flex-col h-full",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm z-10">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Previous Generations
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {previousGenerations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No previous generations
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your generation history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {previousGenerations.map((generation) => (
                <button
                  key={generation.id}
                  className={cn(
                    "w-full text-left p-3 hover:bg-accent/30 transition-colors flex flex-col",
                    activeGeneration?.id === generation.id && "bg-accent/50"
                  )}
                  onClick={() => handleLoadPreviousGeneration(generation)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium line-clamp-1">{generation.title}</h4>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span>{formatDate(generation.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Toggle sidebar button (only visible when sidebar is closed) */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-20 h-10 w-6 rounded-l-none rounded-r-md border border-l-0 bg-card/80 z-10"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
        
        <div className="flex-grow overflow-auto p-4">
          <div className="max-w-5xl mx-auto h-full">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-medium flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {activeGeneration ? 'Story Archive' : 'Content Generator'}
                {loading && (
                  <span className="text-xs bg-muted text-muted-foreground py-0.5 px-2 rounded-full ml-2 flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </span>
                )}
              </h1>
              
              <div className="flex space-x-3">
                {activeGeneration && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveGeneration(null)}
                    className="flex items-center gap-1.5"
                  >
                    Return to Current
                  </Button>
                )}
                
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleGeneration}
                  disabled={loading}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  {loading ? 'Generating...' : 'Regenerate'}
                </Button>
                
                <Button 
                  variant={activeGeneration ? "default" : "outline"}
                  size="sm"
                  onClick={onBackToHome}
                  className="flex items-center gap-1.5"
                >
                  Edit Parameters
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto">
              {/* Story content */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Story Output
                  </div>
                  {displayContent && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyText}
                        className="h-6 w-6"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownloadText}
                        className="h-6 w-6"
                        title="Download as text file"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  )}
                </h3>
                {loading && !activeGeneration ? (
                  <div className="rounded-md border h-full min-h-[300px] flex flex-col items-center justify-center p-6">
                    <RefreshCw className="h-6 w-6 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Generating your story...
                    </p>
                  </div>
                ) : displayContent ? (
                  <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap border rounded-md shadow-sm bg-card min-h-[300px] overflow-auto">
                    {displayContent}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed h-full min-h-[300px] flex flex-col items-center justify-center p-6">
                    <FileText className="h-6 w-6 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground max-w-md mx-auto text-center">
                      Your generated story will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Image content */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Image Output
                  </div>
                  {displayImage && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownloadImage}
                        className="h-6 w-6"
                        title="Download image"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  )}
                </h3>
                {loading && !activeGeneration ? (
                  <div className="rounded-md border h-full min-h-[300px] flex flex-col items-center justify-center p-6">
                    <RefreshCw className="h-6 w-6 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Generating your image...
                    </p>
                  </div>
                ) : displayImage ? (
                  <div className="border rounded-md shadow-sm overflow-hidden bg-card">
                    <div className="relative pt-[56.25%] min-h-[300px]">
                      <img 
                        src={displayImage} 
                        alt="Generated visualization" 
                        className="absolute top-0 left-0 w-full h-full object-contain bg-muted/30"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed h-full min-h-[300px] flex flex-col items-center justify-center p-6">
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground max-w-md mx-auto text-center">
                      Your generated image will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Generation metadata (optional) */}
              {displayMetadata && (
                <div className="border rounded-md p-3 bg-muted/20 lg:col-span-2 mt-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Generation Info
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {displayMetadata.fiction && (
                      <div>
                        <p className="text-muted-foreground">Text Model:</p>
                        <p className="font-medium">{displayMetadata.fiction.model}</p>
                      </div>
                    )}
                    {displayMetadata.image && (
                      <div>
                        <p className="text-muted-foreground">Image Model:</p>
                        <p className="font-medium">{displayMetadata.image.model}</p>
                      </div>
                    )}
                    {displayMetadata.fiction?.tokens && (
                      <div>
                        <p className="text-muted-foreground">Tokens Used:</p>
                        <p className="font-medium">{displayMetadata.fiction.tokens}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generation;