import React, { useState, useEffect, useMemo, memo } from 'react';
import { fetchParameters } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, X, ArrowLeft, Frown, Tag } from 'lucide-react';
import { cn } from '../lib/utils';


// Memoized parameter component for performance
const MemoizedParameter = memo(({ parameter, onAddParameter, isSelected }) => {
  return (
    <div className="py-3 flex items-center justify-between border-b last:border-0">
      <h3 className="text-sm truncate">{parameter.name}</h3>
            <Button
        onClick={() => !isSelected && onAddParameter(parameter)}
        variant={isSelected ? "secondary" : "outline"}
        size="sm"
        disabled={isSelected}
        className="min-w-[60px] h-9"
      >
        {isSelected ? "Added" : "Add"}
      </Button>
    </div>
  );
});

const Parameters = ({ 
  selectedCategory, 
  selectedParameters, 
  onParameterSelect,
  onParameterRemove 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Current selected category (assuming it's the first in the array)
  const currentCategory = selectedCategory && selectedCategory.length > 0 ? selectedCategory[0] : null;

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch parameters for selected category
  useEffect(() => {
    const fetchParametersForCategory = async () => {
      if (!currentCategory) {
        setParameters([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchParameters(currentCategory.id);
        const categoryParameters = result.data || [];
        
        // Add category information to parameters
        const processedParameters = categoryParameters.map(param => ({
          ...param,
          categoryId: currentCategory.id,
          categoryName: currentCategory.name
        }));
        
        setParameters(processedParameters);
      } catch (err) {
        console.error('Error fetching parameters:', err);
        setError('Failed to load parameters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParametersForCategory();
  }, [currentCategory]);

  // Filter parameters based on search query
  const filteredParameters = useMemo(() => {
    return parameters.filter(param => {
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const nameMatch = param.name?.toLowerCase().includes(query);
        const descMatch = param.description?.toLowerCase().includes(query);
        const typeMatch = param.type?.toLowerCase().includes(query);
        
        return nameMatch || descMatch || typeMatch;
      }
      return true;
    });
  }, [parameters, debouncedSearchQuery]);

  // Check if a parameter is already selected
  const isParameterSelected = (parameter) => {
    return selectedParameters.some(p => p.id === parameter.id);
  };

  // Handle adding a parameter
  const handleAddParameter = (parameter) => {
    onParameterSelect(parameter);
  };

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

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">
            {currentCategory?.name || "Parameters"}
          </h2>
          {filteredParameters?.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {filteredParameters.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {currentCategory && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder={`Search parameters...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-md border bg-transparent px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {!currentCategory ? (
        <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)] text-center">
          <ArrowLeft className="h-6 w-6 text-muted-foreground mb-2" />
          <h3 className="text-sm font-medium mb-1">Select a Genre</h3>
          <p className="text-muted-foreground text-xs">
            Choose a genre from the left panel to see available parameters.
          </p>
        </div>
      ) : filteredParameters?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100%-5rem)] text-center">
          {searchQuery ? (
            <>
              <Frown className="h-6 w-6 text-muted-foreground mb-2" />
              <h3 className="text-sm font-medium mb-1">No matching parameters</h3>
              <p className="text-muted-foreground text-xs mb-2">
                Try adjusting your search or clear the filter.
              </p>
              <Button variant="link" size="sm" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <Tag className="h-6 w-6 text-muted-foreground mb-2" />
              <h3 className="text-sm font-medium mb-1">No parameters available</h3>
              <p className="text-muted-foreground text-xs">
                Select a different genre to explore parameters.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="max-h-[calc(100vh-220px)] overflow-auto">
          {filteredParameters.map(parameter => (
            <MemoizedParameter
              key={parameter.id}
              parameter={parameter}
              onAddParameter={handleAddParameter}
              isSelected={isParameterSelected(parameter)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Parameters;