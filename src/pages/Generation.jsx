import React, { useState, useEffect } from 'react';
import { generateContent } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';
import { Copy, Download, Check } from 'lucide-react';
import { copyToClipboard, downloadTextFile, downloadImage } from '../utils/exportUtils';

const Generation = ({ setGeneratedContent, generatedContent }) => {
  const [parameterValues, setParameterValues] = useState({});
  const [categoryIds, setCategoryIds] = useState([]);
  const [contentType, setContentType] = useState('fiction');
  const [generatedImage, setGeneratedImage] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Set parameters and categories when they change in the parent component
  useEffect(() => {
    const checkAppState = () => {
      if (window.appState && window.appState.parameters) {
        setParameterValues(window.appState.parameters);
      }
      if (window.appState && window.appState.categories) {
        setCategoryIds(window.appState.categories);
      }
      if (window.appState && window.appState.contentType) {
        setContentType(window.appState.contentType);
      }
    };
    
    // Initial check
    checkAppState();
    
    // Setup interval to poll for changes
    const interval = setInterval(checkAppState, 500);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Handle copying text to clipboard
  const handleCopyText = async () => {
    if (!generatedContent) return;
    
    const success = await copyToClipboard(generatedContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Handle downloading text as file
  const handleDownloadText = () => {
    if (!generatedContent) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `story-${timestamp}.txt`;
    downloadTextFile(generatedContent, filename);
  };
  
  // Handle downloading image
  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `image-${timestamp}.png`;
    downloadImage(generatedImage, filename);
  };


  // Function to handle generation with error handling
  const handleGeneration = async () => {
    // For debugging, log the current state
    console.log("Generation attempt with:", {
      parameterValues,
      categoryIds: categoryIds || [],
      contentType
    });
    
    // Validate parameters before generating
    if (!categoryIds || categoryIds.length === 0) {
      setError('Please select at least one category first');
      return;
    }
    
    if (!parameterValues || Object.keys(parameterValues).length === 0) {
      setError('Please set parameters before generating');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await generateContent(parameterValues, categoryIds, contentType);
      console.log("API response:", response);
      
      if (!response) {
        throw new Error('Empty response received from server');
      }
      
      // Check for success response
      if (response.success === true) {
        // Store metadata regardless of content type
        if (response.metadata) {
          setMetadata(response.metadata);
        }
        
        // Handle content based on type
        if (contentType === 'fiction' || contentType === 'combined') {
          if (!response.content) {
            console.warn('No content in fiction response');
          } else {
            setGeneratedContent(response.content);
          }
        }
        
        if (contentType === 'image' || contentType === 'combined') {
          // Per API spec, image data is in imageData property
          if (!response.imageData) {
            console.warn('No image data in image response');
          } else {
            // For base64 encoded images, we need to create a data URL
            const imgSrc = response.imageData.startsWith('data:') 
              ? response.imageData 
              : `data:image/png;base64,${response.imageData}`;
            setGeneratedImage(imgSrc);
          }
        }
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        throw new Error('Server returned an unsuccessful response');
      }
    } catch (err) {
      console.error('Generation error:', err);
      
      let errorMessage = 'Failed to generate content';
      
      if (err.data) {
        if (typeof err.data === 'object') {
          if (err.data.error) {
            if (typeof err.data.error === 'object' && err.data.error.message) {
              errorMessage = `API Error: ${err.data.error.message}`;
            } else {
              errorMessage = `Error: ${err.data.error}`;
            }
          } else {
            errorMessage = `Error: ${JSON.stringify(err.data)}`;
          }
        } else if (typeof err.data === 'string') {
          errorMessage = `Error: ${err.data}`;
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-ping rounded-full bg-primary/10"></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-primary">
            {contentType === 'fiction' 
              ? 'Creating your story...' 
              : contentType === 'image' 
                ? 'Crafting your image...' 
                : 'Generating content...'}
          </p>
          <div className="flex justify-center items-center gap-1 mt-2">
            <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce delay-75"></div>
            <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-6 max-w-sm mx-auto">
            We're processing your parameters to create high-quality content. This may take a few moments.
          </p>
        </div>
      </div>
    );
  }

  const isGenerationReady = Object.keys(parameterValues).length > 0 && categoryIds.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col space-y-2 mb-3">
        <div>
          <h2 className="text-lg font-bold mb-1">
            Story Generator
          </h2>
        </div>
        
        <Button 
          variant="default"
          size="sm"
          onClick={handleGeneration}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-900 shadow-sm transition-colors py-1 text-sm"
        >
          Generate Story
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-1 rounded-lg border-0 shadow-sm bg-destructive/10">
          <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-auto pr-1">
        {/* Story content - show for fiction or combined */}
        {(contentType === 'fiction' || contentType === 'combined') && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-1">📝</span>
                STORY OUTPUT
              </div>
              {generatedContent && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyText}
                    className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-foreground border border-border transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={handleDownloadText}
                    className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-foreground border border-border transition-colors"
                    title="Download as text file"
                  >
                    <Download size={14} />
                  </button>
                </div>
              )}
            </h3>
            {generatedContent ? (
              <div className="unsplash-card p-4 text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none border border-border/30 rounded-lg shadow-sm bg-white">
                {generatedContent}
              </div>
            ) : (
              <div className="rounded-lg p-8 border-2 border-dashed border-muted-foreground/20 text-center bg-white/50 dark:bg-background/20 min-h-[180px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-accent/30 flex items-center justify-center mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="text-base font-medium mb-2">Story Output</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your generated story will appear here after generation.
                </p>
                <div className="mt-4 bg-gray-100 p-2 rounded text-xs text-muted-foreground border border-border/30">
                  <p><strong>Example output:</strong> "In the bustling city of New Metro, where technology and tradition clashed in unexpected ways..."</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Image content - show for image or combined */}
        {(contentType === 'image' || contentType === 'combined') && (
          <div className="space-y-3">
            <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">🖼️</span>
                Image Output
              </div>
              {generatedImage && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownloadImage}
                    className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-foreground border border-border transition-colors"
                    title="Download image"
                  >
                    <Download size={16} />
                  </button>
                </div>
              )}
            </h3>
            {generatedImage ? (
              <div className="unsplash-card p-0 overflow-hidden elevated-hover shadow-sm">
                <div className="relative">
                  <img 
                    src={generatedImage} 
                    alt="AI Generated Image"
                    className="max-w-full w-full object-contain mx-auto"
                  />
                </div>
                <div className="p-4 bg-white dark:bg-background/10 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Generated image based on your selected parameters
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg p-8 border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-background/20">
                <div className="bg-accent/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h4 className="text-lg font-medium mb-2">No Image Generated</h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your generated image will appear here. Click the Generate button above when you're ready.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Metadata display if available */}
        {metadata && (
          <div className="pt-6 border-t border-dashed">
            <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider flex items-center mb-4">
              <span className="mr-2">🔍</span>
              Generation Details
            </h3>
            <div className="bg-white/80 dark:bg-background/20 rounded-lg shadow-sm p-5 border border-border/20 overflow-hidden">
              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-8 gap-y-3">
                  {contentType === 'fiction' && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-md">
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Model</span>
                        <p className="text-foreground">{metadata.model || 'Not specified'}</p>
                      </div>
                      {metadata.tokens && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-md">
                          <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Tokens</span>
                          <p className="text-foreground">{metadata.tokens}</p>
                        </div>
                      )}
                    </>
                  )}
                  {contentType === 'image' && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-md">
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Model</span>
                        <p className="text-foreground">{metadata.model || 'Not specified'}</p>
                      </div>
                      {metadata.prompt && (
                        <div className="col-span-2 mt-1 bg-accent/10 p-3 rounded-md shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-1">Prompt</p>
                          <p className="text-foreground italic">{metadata.prompt}</p>
                        </div>
                      )}
                    </>
                  )}
                  {contentType === 'combined' && metadata.fiction && metadata.image && (
                    <>
                      <div className="col-span-2 mb-3">
                        <h4 className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Story Generation
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-md">
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Model</span>
                        <p className="text-foreground">{metadata.fiction.model || 'Not specified'}</p>
                      </div>
                      {metadata.fiction.tokens && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-md">
                          <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Tokens</span>
                          <p className="text-foreground">{metadata.fiction.tokens}</p>
                        </div>
                      )}
                      
                      <div className="col-span-2 mt-5 mb-3">
                        <h4 className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Image Generation
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-md">
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Model</span>
                        <p className="text-foreground">{metadata.image.model || 'Not specified'}</p>
                      </div>
                      
                      <div className="col-span-2 h-px bg-border/50 my-2"></div>
                      
                      {metadata.image.prompt && (
                        <div className="col-span-2 mt-1 bg-accent/10 p-3 rounded-md shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-1">Image Prompt</p>
                          <p className="text-foreground italic">{metadata.image.prompt}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generation;