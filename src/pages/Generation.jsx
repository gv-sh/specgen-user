import React, { useState, useEffect } from 'react';
import { generateContent } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';

const Generation = ({ setGeneratedContent, generatedContent }) => {
  const [parameterValues, setParameterValues] = useState({});
  const [categoryIds, setCategoryIds] = useState([]);
  const [contentType, setContentType] = useState('fiction');
  const [generatedImage, setGeneratedImage] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      <div className="flex flex-col items-center justify-center py-12 space-y-5">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-ping rounded-full bg-primary/20"></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-primary font-medium">
            {contentType === 'fiction' ? 'Generating your story...' : 
             contentType === 'image' ? 'Generating your image...' : 
             'Generating your story and image...'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  const isGenerationReady = Object.keys(parameterValues).length > 0 && categoryIds.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center pb-2 border-b border-muted">
        <h2 className="text-xl font-semibold tracking-tight">
          {contentType === 'fiction' ? 'Generated Story' : 
           contentType === 'image' ? 'Generated Image' : 
           'Generated Story & Image'}
        </h2>
        
        <Button 
          variant="default"
          size="sm"
          onClick={handleGeneration}
          className="relative bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground rounded-lg px-4"
        >
          Generate
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-1 border-l-4 border-l-destructive rounded-lg">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6 max-h-[calc(100vh-220px)] overflow-auto pr-1">
        {/* Story content - show for fiction or combined */}
        {(contentType === 'fiction' || contentType === 'combined') && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Story</h3>
            {generatedContent ? (
              <Card className="bg-card/50 shadow-inner rounded-lg">
                <CardContent className="p-5 text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                  {generatedContent}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg">
                <CardContent className="flex flex-col justify-center items-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xl">📝</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    No story generated yet. Click "Generate" to create a story.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Image content - show for image or combined */}
        {(contentType === 'image' || contentType === 'combined') && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Image</h3>
            {generatedImage ? (
              <div className="flex justify-center">
                <Card className="overflow-hidden border-2 border-muted shadow-md rounded-lg">
                  <div className="relative">
                    <img 
                      src={generatedImage} 
                      alt="AI Generated Image"
                      className="max-h-[400px] w-auto object-contain mx-auto"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg"></div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg">
                <CardContent className="flex flex-col justify-center items-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xl">🖼️</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    No image generated yet. Click "Generate" to create an image.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Metadata display if available */}
        {metadata && (
          <div className="pt-5 border-t border-dashed">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium">Generation Details</h3>
              <div className="h-px flex-1 bg-muted"></div>
            </div>
            <Card className="bg-muted/20 rounded-lg overflow-hidden">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-2">
                  {contentType === 'fiction' && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                        <p><span className="font-medium">Model:</span> {metadata.model || 'Not specified'}</p>
                      </div>
                      {metadata.tokens && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                          <p><span className="font-medium">Tokens:</span> {metadata.tokens}</p>
                        </div>
                      )}
                    </>
                  )}
                  {contentType === 'image' && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                        <p><span className="font-medium">Model:</span> {metadata.model || 'Not specified'}</p>
                      </div>
                      {metadata.prompt && (
                        <div className="col-span-2 mt-1 bg-muted/40 p-2 rounded border border-muted">
                          <p><span className="font-medium">Prompt:</span> {metadata.prompt}</p>
                        </div>
                      )}
                    </>
                  )}
                  {contentType === 'combined' && metadata.fiction && metadata.image && (
                    <>
                      <div className="col-span-2 mb-1 pb-1 border-b">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Fiction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                        <p><span className="font-medium">Model:</span> {metadata.fiction.model || 'Not specified'}</p>
                      </div>
                      {metadata.fiction.tokens && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                          <p><span className="font-medium">Tokens:</span> {metadata.fiction.tokens}</p>
                        </div>
                      )}
                      
                      <div className="col-span-2 mt-3 mb-1 pb-1 border-b">
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Image</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                        <p><span className="font-medium">Model:</span> {metadata.image.model || 'Not specified'}</p>
                      </div>
                      {metadata.image.prompt && (
                        <div className="col-span-2 mt-1 bg-muted/40 p-2 rounded border border-muted">
                          <p><span className="font-medium">Prompt:</span> {metadata.image.prompt}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generation;