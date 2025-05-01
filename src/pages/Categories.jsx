import React, { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Folder, FolderOpen, ChevronRight } from 'lucide-react';
import { Tooltip } from '../components/ui/tooltip';

const Categories = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  // Handle category selection - modified for single selection
  const handleCategorySelect = useCallback((category) => {
    // If the same category is clicked again, don't clear the selection
    // This allows the user to keep viewing the same category's parameters
    setSelectedCategory(category);
    
    // Send the selected category to parent component
    if (onCategorySelect && typeof onCategorySelect === 'function') {
      onCategorySelect([category]); // Still pass as array for compatibility
    }
  }, [onCategorySelect]);

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
        <h2 className="text-sm">Explore Genres</h2>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <div className="overflow-y-auto h-[calc(100vh-220px)] pr-1 space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategory && selectedCategory.id === category.id;
            
            return (
              <Tooltip 
                key={category.id} 
                content={category.description || 'No description available'}
                position="right"
              >
                <div 
                  className={`
                    flex items-center space-x-3 rounded-lg px-3 py-2 min-h-[3rem]
                    cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-primary/10 border border-primary/25 shadow-sm' 
                      : 'hover:bg-gray-100 border border-transparent'}
                  `}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="text-muted-foreground">
                    {isSelected ? (
                      <FolderOpen className="h-5 w-5 text-primary" />
                    ) : (
                      <Folder className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${isSelected ? 'text-primary' : ''}`}>
                      {category.name}
                    </div>
                  </div>
                  
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${isSelected ? 'text-primary rotate-90' : 'text-muted-foreground'}`} 
                  />
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;