import React, { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
// Removed Tooltip import as we no longer need it

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

  // We're no longer using descriptions

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-4">
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
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h2 className="text-lg font-bold mb-1">Explore Genres</h2>
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">SELECTED</h3>
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

      <div className="flex-grow overflow-hidden">
        <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">AVAILABLE</h3>
        
        <div className="overflow-y-auto h-[calc(100vh-220px)] pr-1 space-y-1.5">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`
                flex items-center space-x-3 rounded-lg px-3 py-1.5 min-h-[3rem]
                hover:bg-gray-100 cursor-pointer transition-colors
                ${selectedCategories.includes(category.id) 
                  ? 'bg-gray-100 border border-border shadow-sm' 
                  : 'border border-transparent'}
              `}
              onClick={() => handleCategorySelect(category.id)}
            >
              <input 
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategorySelect(category.id)}
                className="h-4 w-4 rounded-sm border-primary shadow focus:ring-primary text-primary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{category.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;