import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  CircularProgress, 
  Alert,
  Paper,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { generateFiction } from '../services/api';

const Generation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse parameter values and category IDs from location state using useMemo
  const parameterValues = useMemo(() => location.state?.parameterValues || {}, [location.state]);
  const categoryIds = useMemo(() => location.state?.categoryIds || [], [location.state]);
  const generationType = useMemo(() => location.state?.generationType || 'fiction', [location.state]);
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle generation with better error handling
  const handleGeneration = async (params, categories, type) => {
    try {
      setLoading(true);
      setError(null);
      
      // Log parameters for debugging
      console.log('Generating with parameters:', params);
      console.log('Categories:', categories);
      console.log('Generation type:', type);
      
      // Call the API
      const response = await generateFiction(params, categories, type);
      
      // Validate response structure
      if (!response) {
        throw new Error('Empty response received from server');
      }
      
      // Check for success response
      if (response.success === true) {
        if (type === 'fiction') {
          if (!response.content) {
            throw new Error('Server returned success but no content was provided');
          }
          setGeneratedContent(response.content);
        } else {
          if (!response.imageUrl) {
            throw new Error('Server returned success but no image URL was provided');
          }
          setGeneratedImage(response.imageUrl);
        }
        return true;
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        throw new Error('Server returned an unsuccessful response');
      }
    } catch (err) {
      // Enhanced error reporting
      console.error('Generation error:', err);
      
      let errorMessage = 'Failed to generate content';
      
      if (err.response) {
        // Server responded with an error
        const serverError = err.response.data?.error || err.response.statusText;
        errorMessage = `Server error: ${serverError} (${err.response.status})`;
        console.error('Server response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        // Client-side error
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate content on initial load
  useEffect(() => {
    // Check if we have parameters
    if (!location.state || Object.keys(parameterValues).length === 0) {
      navigate('/categories');
      return;
    }
    
    // Flag to track if the component is still mounted
    let isMounted = true;
    
    // Generate content using real API
    const generateWithAPI = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Always attempt to generate with the API
        const success = await handleGeneration(parameterValues, categoryIds, generationType);
        
        // Only update state if component still mounted
        if (!isMounted) return;
        
        if (!success) {
          setError('There was an error connecting to the AI service. Please try again.');
        }
      } catch (err) {
        if (isMounted) {
          setError(`Error: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Call the generation function
    generateWithAPI();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [location.state, parameterValues, categoryIds, generationType, navigate]);

  // Handle regenerate button click
  const handleRegenerate = () => {
    // Show loading state
    setLoading(true);
    setError(null);
    
    // Attempt to regenerate with the API, no fallback to samples
    handleGeneration(parameterValues, categoryIds, generationType).then(success => {
      setLoading(false);
      if (!success) {
        setError('Failed to generate content. Please try again or adjust your parameters.');
      }
    }).catch(err => {
      setLoading(false);
      setError(`Error: ${err.message}`);
    });
  };

  // Handle back button click
  const handleBack = () => {
    // Use route state consistently instead of mixing with search params
    navigate('/parameters', { 
      state: { 
        selectedCategories: categoryIds.map(id => ({ id })),
        parameterValues, 
        generationType 
      }
    });
  };

  // Display loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {generationType === 'fiction' ? 'Generating your story...' : 'Generating your image...'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {generationType === 'fiction' ? 'Your Generated Story' : 'Your Generated Image'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {generationType === 'fiction' ? (
        // Fiction display
        <Paper sx={{ p: 3, mb: 4 }}>
          {generatedContent ? (
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {generatedContent}
            </Typography>
          ) : (
            <Card sx={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  No content generated yet. Click "Regenerate" to create a story.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      ) : (
        // Image display
        <Paper sx={{ p: 3, mb: 4 }}>
          {generatedImage ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Card sx={{ maxWidth: '100%', mb: 2 }}>
                <CardMedia
                  component="img"
                  image={generatedImage}
                  alt="AI Generated Image"
                  sx={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                />
              </Card>
            </Box>
          ) : (
            <Card sx={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  No image generated yet. Click "Regenerate" to create an image.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={handleBack}
        >
          Back to Parameters
        </Button>
        <Button 
          variant="contained" 
          onClick={handleRegenerate}
        >
          Regenerate {generationType === 'fiction' ? 'Story' : 'Image'}
        </Button>
      </Box>
    </Container>
  );
};

export default Generation; 