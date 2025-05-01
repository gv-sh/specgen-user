import React, { useState, useEffect, useMemo, memo } from 'react';
import { fetchParameters } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, X, Plus, ArrowLeft } from 'lucide-react';
import { stringToColor } from '../utils/colorUtils';
import TipBanner from '../components/TipBanner';

// Memoized parameter component for performance
const MemoizedParameter = memo(({ parameter, onAddParameter }) => {
  const typeBadge = {
    'Dropdown': 'bg-blue-50 text-blue-700',
    'Slider': 'bg-amber-50 text-amber-700',
    'Toggle Switch': 'bg-green-50 text-green-700',
    'Radio Buttons': 'bg-purple-50 text-purple-700',
    'Checkbox': 'bg-indigo-50 text-indigo-700'
  }[parameter.type] || 'bg-gray-100 text-gray-700';

  return (
    <div className="mb-3 last:mb-0 bg-white border border-border/60 rounded-lg p-3 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 mr-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{parameter.name}</h3>
            <Badge className={`text-[9px] px-1.5 py-px ${typeBadge}`}>
              {parameter.type}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAddParameter(parameter)}
          className="h-7 px-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      
      {parameter.description && (
        <p className="text-xs text-muted-foreground">
          {parameter.description}
        </p>
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
  const [showTip, setShowTip] = useState(true);

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
          <h3 className="text-lg font-medium mb-2">Select a Genre</h3>
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
          <h2 className="text-lg font-bold">{currentCategory.name} Parameters</h2>
          <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
            {filteredParameters.length}
          </Badge>
        </div>
        {currentCategory.description && (
          <p className="text-sm text-muted-foreground">{currentCategory.description}</p>
        )}
      </div>

      {showTip && (
        <TipBanner 
          message="Click the 'Add' button to select parameters for your story. You can mix parameters from different genres."
          onClose={() => setShowTip(false)}
        />
      )}

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
          className="pl-8 h-9 w-full rounded-md border border-input/60 bg-white px-2.5 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
        <div className="py-6 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border border-border">
          <p className="text-foreground/70">
            No parameters found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-primary underline"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-auto pr-1">
        {filteredParameters.length > 0 ? (
          filteredParameters.map(parameter => (
            <MemoizedParameter
              key={parameter.id}
              parameter={parameter}
              onAddParameter={handleAddParameter}
            />
          ))
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <p className="text-foreground/70">
              No parameters available for this genre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parameters;