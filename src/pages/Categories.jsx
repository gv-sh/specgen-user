import React, { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../services/api';
import { Checkbox } from '../components/ui/checkbox';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const Categories = ({ onCategorySelect }) => {
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

  // Send selected category to parent component when it changes
  useEffect(() => {
    // Get the full category objects for the selected IDs
    const selectedCategoryObjects = categories.filter(cat => 
      selectedCategories.includes(cat.id)
    );
    
    // Update global state directly
    if (window.appState) {
      window.appState.categories = selectedCategories;
    } else {
      window.appState = { categories: selectedCategories };
    }
    
    // Also send to parent component via props
    if (onCategorySelect && typeof onCategorySelect === 'function') {
      onCategorySelect(selectedCategoryObjects);
    }
    
    console.log("Updated categories:", selectedCategories);
    
  }, [selectedCategories, categories, onCategorySelect]);

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
        return 'Explore futuristic technology';
      case 'fantasy':
        return 'Magic, mythical creatures';
      case 'horror':
        return 'Tension, fear, supernatural';
      default:
        return 'Create stories in this genre';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center space-y-2 py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (categories.length === 0) {
    return (
      <Alert>
        <AlertDescription>No categories available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Select Genres</h2>
      
      {selectedCategories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Selected</h3>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map(id => {
              const category = categories.find(c => c.id === id);
              return (
                <Button
                  key={id}
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 text-xs rounded-full"
                  onClick={() => handleCategorySelect(id)}
                >
                  {category?.name || id}
                  <span className="ml-1">×</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-auto py-1">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={`flex items-center space-x-2 rounded-lg px-2 py-2 hover:bg-accent cursor-pointer ${selectedCategories.includes(category.id) ? 'bg-accent/50' : ''}`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <input 
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategorySelect(category.id)}
              className="h-4 w-4 rounded-sm border border-primary checked:bg-primary"
            />
            <div className="grid gap-0.5">
              <div className="text-sm font-medium">{category.name}</div>
              <div className="text-xs text-muted-foreground">{getCategoryDescription(category.id)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;