import React, { useState, useEffect } from 'react';
import { generateContent } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';
import { Copy, Download, Check } from 'lucide-react';
import { copyToClipboard, downloadTextFile, downloadImage } from '../utils/exportUtils';

const Generation = ({ 
  setGeneratedContent, 
  generatedContent, 
  selectedParameters 
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
        'fiction' // Default to fiction for now
      );

      // Handle successful generation
      if (response.success) {
        // Set generated content
        if (response.content) {
          setGeneratedContent(response.content);
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
          disabled={loading}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-900 shadow-sm transition-colors py-1 text-sm"
        >
          {loading ? 'Generating...' : 'Generate Story'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-1 rounded-lg border-0 shadow-sm bg-destructive/10">
          <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-auto pr-1">
        {/* Story content */}
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
      </div>
    </div>
  );
};

export default Generation;