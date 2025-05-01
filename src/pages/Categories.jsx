// src/pages/Categories.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Folder, FolderOpen, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

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

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    
    if (onCategorySelect && typeof onCategorySelect === 'function') {
      onCategorySelect([category]);
    }
  }, [onCategorySelect]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary"></div>
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
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h2 className="text-sm font-medium text-foreground">Explore Genres</h2>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategory?.id === category.id;
            return (
              <button
                key={category.id}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm rounded-md",
                  isSelected 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                )}
                onClick={() => handleCategorySelect(category)}
                title={category.description || 'No description available'}
              >
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <FolderOpen className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                  <span>{category.name}</span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isSelected ? "rotate-90" : ""
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;