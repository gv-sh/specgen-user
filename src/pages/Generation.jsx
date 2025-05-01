// src/pages/Generation.jsx - Complete fixed version
import React, { useState, useEffect, useCallback } from 'react';
import { generateContent } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Copy, Download, Check, Image as ImageIcon, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
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

  // Handle copying text
  const handleCopyText = async () => {
    if (!generatedContent) return;
    
    const success = await copyToClipboard(generatedContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Handle downloading text
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

  // Automatically generate content when the page loads
  useEffect(() => {
    if (selectedParameters.length > 0 && !generatedContent && !loading) {
      handleGeneration();
    }
  }, [generatedContent, handleGeneration, loading, selectedParameters]);

  return (
    <div className="max-w-5xl mx-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium">Content Generator</h1>
        
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            size="sm"
            onClick={handleGeneration}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
            {loading ? 'Generating...' : 'Regenerate'}
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={onBackToHome}
            className="flex items-center"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Back to Parameters
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-4rem)] overflow-auto">
        {/* Story content */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Story Output
            </div>
            {generatedContent && (
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
          {loading ? (
            <div className="rounded-md border h-full min-h-[300px] flex flex-col items-center justify-center p-6">
              <RefreshCw className="h-6 w-6 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">
                Generating your story...
              </p>
            </div>
          ) : generatedContent ? (
            <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap border rounded-md shadow-sm bg-card min-h-[300px] overflow-auto">
              {generatedContent}
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
            <div className="flex items-center">
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Image Output
            </div>
            {generatedImage && (
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
          {loading ? (
            <div className="rounded-md border h-full min-h-[300px] flex flex-col items-center justify-center p-6">
              <RefreshCw className="h-6 w-6 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">
                Generating your image...
              </p>
            </div>
          ) : generatedImage ? (
            <div className="border rounded-md shadow-sm overflow-hidden bg-card">
              <div className="relative pt-[56.25%] min-h-[300px]">
                <img 
                  src={generatedImage} 
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
        {metadata && (
          <div className="border rounded-md p-3 bg-muted/20 lg:col-span-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Generation Info
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {metadata.fiction && (
                <div>
                  <p className="text-muted-foreground">Text Model:</p>
                  <p className="font-medium">{metadata.fiction.model}</p>
                </div>
              )}
              {metadata.image && (
                <div>
                  <p className="text-muted-foreground">Image Model:</p>
                  <p className="font-medium">{metadata.image.model}</p>
                </div>
              )}
              {metadata.fiction?.tokens && (
                <div>
                  <p className="text-muted-foreground">Tokens Used:</p>
                  <p className="font-medium">{metadata.fiction.tokens}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generation;