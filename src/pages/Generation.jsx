// src/pages/Generation.jsx - Updated for standalone page
import React, { useState, useEffect } from 'react';
import { generateContent } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';
import { Copy, Download, Check, Image as ImageIcon, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { copyToClipboard, downloadTextFile, downloadImage } from '../utils/exportUtils';

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
  const validateParameters = () => {
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
  };

  // Organize parameters for API
  const prepareParameterValues = () => {
    const parameterValues = {};
    
    // Group parameters by category
    selectedParameters.forEach(param => {
      if (!parameterValues[param.categoryId]) {
        parameterValues[param.categoryId] = {};
      }
      
      parameterValues[param.categoryId][param.id] = param.value;
    });

    return parameterValues;
  };

  // Handle generation
  const handleGeneration = async () => {
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
      const parameterValues = prepareParameterValues();

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
  };

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
  }, [selectedParameters]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Content Generator</h1>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleGeneration}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Regenerate'}
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={onBackToHome}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Parameters
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-1 mb-4 rounded-lg border-0 shadow-sm bg-destructive/10">
          <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story content */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
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
          {loading ? (
            <div className="rounded-lg p-8 border-2 border-dashed border-muted-foreground/20 text-center bg-white/50 dark:bg-background/20 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mb-3">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generating your story...
              </p>
            </div>
          ) : generatedContent ? (
            <div className="unsplash-card p-4 text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none border border-border/30 rounded-lg shadow-sm bg-white min-h-[300px]">
              {generatedContent}
            </div>
          ) : (
            <div className="rounded-lg p-8 border-2 border-dashed border-muted-foreground/20 text-center bg-white/50 dark:bg-background/20 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your generated story will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Image content */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-1" />
              IMAGE OUTPUT
            </div>
            {generatedImage && (
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadImage}
                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-foreground border border-border transition-colors"
                  title="Download image"
                >
                  <Download size={14} />
                </button>
              </div>
            )}
          </h3>
          {loading ? (
            <div className="rounded-lg p-8 border-2 border-dashed border-muted-foreground/20 text-center bg-white/50 dark:bg-background/20 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mb-3">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generating your image...
              </p>
            </div>
          ) : generatedImage ? (
            <div className="unsplash-card overflow-hidden border border-border/30 rounded-lg shadow-sm bg-white">
              <div className="relative pt-[56.25%] min-h-[300px]">
                <img 
                  src={generatedImage} 
                  alt="Generated visualization" 
                  className="absolute top-0 left-0 w-full h-full object-contain bg-gray-50"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-8 border-2 border-dashed border-muted-foreground/20 text-center bg-white/50 dark:bg-background/20 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mb-3">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your generated image will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Generation metadata (optional) */}
        {metadata && (
          <div className="border border-border/30 rounded-lg p-3 bg-white/50 lg:col-span-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              GENERATION INFO
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