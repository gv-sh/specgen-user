import React, { useState, useEffect, useMemo, memo } from 'react';
import { fetchParameters } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, X, ArrowLeft, Frown, Tag } from 'lucide-react';

// Memoized parameter component for performance
const MemoizedParameter = memo(({ parameter, onAddParameter, isSelected }) => {
  return (
    <div className="py-4 flex items-center justify-between overflow-hidden border-b border-border/60 last:border-b-0">
      <h3 className="text-sm truncate">{parameter.name}</h3>
      {isSelected ? (
        <Badge className="h-8 rounded-md bg-green-100 text-green-700 px-4 flex items-center justify-center transition hover:bg-green-200">
          Added
        </Badge>
      ) : (
        <Button
          onClick={() => onAddParameter(parameter)}
          className="h-8 rounded-md border border-gray-300 bg-white text-gray-900 px-4 hover:bg-gray-100 transition"
        >
          Add
        </Button>
      )}
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
      <div className="flex flex-col justify-center items-center h-full py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading parameters...</p>
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

  if (!currentCategory) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-gray-50 rounded-lg p-8 text-center max-w-md">
          <ArrowLeft className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm mb-2">Select a Genre</h3>
          <p className="text-muted-foreground">
            Choose a genre from the left panel to see available parameters for your story.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="flex items-center mb-2">
          <h2 className="text-sm">{currentCategory.name} Parameters</h2>
          <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
            {filteredParameters.length}
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={`Search ${currentCategory.name} parameters...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 w-full rounded-md border border-input/60 bg-white py-1 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

      {searchQuery && filteredParameters.length === 0 && (
        <div className="py-10 px-6 flex flex-col items-center justify-center text-center bg-gray-50 rounded-md border border-border">
          <Frown className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-foreground mb-2">
            No parameters match your search.
          </p>
          <p className="text-sm text-foreground/70 mb-4">
            Try adjusting your search or clear the filter to see more results.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-primary underline"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="max-h-[calc(100vh-280px)] overflow-auto pr-1">
        {filteredParameters.length > 0 ? (
          filteredParameters.map(parameter => (
            <MemoizedParameter
              key={parameter.id}
              parameter={parameter}
              onAddParameter={handleAddParameter}
              isSelected={isParameterSelected(parameter)}
            />
          ))
        ) : (
          <div className="py-10 px-6 flex flex-col items-center justify-center text-center bg-gray-50 rounded-md border border-border">
            <Tag className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-foreground mb-2">
              No parameters in this genre.
            </p>
            <p className="text-sm text-foreground/70">
              Select a different genre to explore available parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parameters;