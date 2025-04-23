import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress, 
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { fetchCategories } from '../services/api';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await fetchCategories();
        
        // Filter categories that should be shown
        const visibleCategories = (response.data || [])
          .filter(category => category.visibility === 'Show');
          
        setCategories(visibleCategories);
        setError(null);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle category selection/deselection
  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  // Navigate to parameters page with selected categories
  const handleContinue = useCallback(() => {
    if (selectedCategories.length > 0) {
      // Get the full category objects for the selected IDs
      const selectedCategoryObjects = categories.filter(cat => 
        selectedCategories.includes(cat.id)
      );
      
      // Navigate with the selected category objects in state
      navigate('/parameters', { 
        state: { selectedCategories: selectedCategoryObjects }
      });
    }
  }, [navigate, selectedCategories, categories]);

  // Helper function to get category descriptions
  const getCategoryDescription = (categoryId) => {
    // Find the category in our loaded categories
    const category = categories.find(cat => cat.id === categoryId);
    
    // If we have a description from the API, use it
    if (category && category.description) {
      return category.description;
    }
    
    // Fallback descriptions for common genres if not in the API
    switch (categoryId) {
      case 'science-fiction':
        return 'Explore futuristic technology, space travel, and scientific advancements';
      case 'fantasy':
        return 'Delve into worlds of magic, mythical creatures, and epic adventures';
      case 'horror':
        return 'Experience tension, fear, and the supernatural or psychological unknown';
      default:
        return 'Create unique stories in this genre';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (categories.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">No categories available. Please check back later.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Choose Your Genres
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph align="center" sx={{ mb: 4 }}>
        Select one or more genres to begin crafting your story
      </Typography>
      
      {selectedCategories.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Genres:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {selectedCategories.map(id => {
              const category = categories.find(c => c.id === id);
              return (
                <Chip
                  key={id}
                  label={category?.name || id}
                  color="primary"
                  onDelete={() => handleCategorySelect(id)}
                  sx={{ m: 0.5 }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                border: selectedCategories.includes(category.id) ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getCategoryDescription(category.id)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color={selectedCategories.includes(category.id) ? "primary" : "inherit"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategorySelect(category.id);
                  }}
                >
                  {selectedCategories.includes(category.id) ? "Selected" : "Select"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          size="large"
          disabled={selectedCategories.length === 0}
          onClick={handleContinue}
          sx={{ py: 1.5, px: 4 }}
        >
          Continue to Parameters
        </Button>
      </Box>
    </Container>
  );
};

export default Categories; 