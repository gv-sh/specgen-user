import React, { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tooltip } from '../components/ui/tooltip';

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
      <div className="mb-3">
        <h2 className="text-lg font-bold mb-1">Explore Genres</h2>
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Selected</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(id => {
              const category = categories.find(c => c.id === id);
              return (
                <Button
                  key={id}
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-foreground border border-border px-2.5 py-1 flex items-center"
                  onClick={() => handleCategorySelect(id)}
                >
                  {category?.name || id}
                  <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-xs">
                    ×
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-auto pr-1">
        <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Available</h3>
        
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={`
              flex items-center space-x-3 rounded-lg px-3 py-2 h-[4.5rem]
              hover:bg-gray-100 cursor-pointer transition-colors
              ${selectedCategories.includes(category.id) 
                ? 'bg-gray-100 border border-border shadow-sm' 
                : 'border border-transparent'
              }
            `}
            onClick={() => handleCategorySelect(category.id)}
          >
            <input 
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategorySelect(category.id)}
              className="h-4 w-4 rounded-sm border-primary shadow focus:ring-primary text-primary flex-shrink-0"
            />
            <div className="grid gap-1">
              <div className="text-sm font-medium">{category.name}</div>
              <Tooltip content={getCategoryDescription(category.id)}>
                <div className="text-xs text-muted-foreground leading-snug line-clamp-2">{getCategoryDescription(category.id)}</div>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;