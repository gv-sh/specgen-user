import React, { useState, useEffect, useMemo, memo } from 'react';
import { fetchParameters } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, Settings, SlidersHorizontal, List, X, Plus, Minus } from 'lucide-react';
import { stringToColor } from '../utils/colorUtils';
import { useScreenSize } from '../utils/responsiveUtils';

// Memoized parameter component for performance
const MemoizedParameter = memo(({ parameter, onAddParameter }) => {
  return (
    <div className="mb-2 last:mb-0 hover:bg-gray-50 p-0.5 rounded-md transition-colors flex items-center justify-between">
      <div className="flex-1 mr-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm truncate">{parameter.name}</h3>
          {parameter.categoryName && (
            <Badge className="text-[9px] px-1.5 py-px">
              {parameter.categoryName}
            </Badge>
          )}
        </div>
        {parameter.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {parameter.description}
          </p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddParameter(parameter)}
        className="h-7 px-2"
      >
        <Plus className="h-4 w-4 mr-1" /> Add
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
  const [parameterView, setParameterView] = useState('category');

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch parameters for selected categories
  useEffect(() => {
    const fetchParametersForCategories = async () => {
      if (!selectedCategory || selectedCategory.length === 0) {
        setParameters([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const allParameters = [];
        const parameterNameTracker = new Set();

        // Fetch parameters for each selected category
        for (const category of selectedCategory) {
          const result = await fetchParameters(category.id);
          const categoryParameters = result.data || [];

          if (categoryParameters.length > 0) {
            // Process parameters to handle duplicates
            const parametersWithCategoryId = categoryParameters.map(param => {
              const paramName = param.name.trim();
              const uniqueIdentifier = `${paramName}_${param.type}`;

              // Check if we've already seen this parameter name
              if (parameterNameTracker.has(uniqueIdentifier)) {
                // This is a duplicate, modify the name for clarity
                return {
                  ...param,
                  categoryId: category.id,
                  originalName: paramName,
                  name: `${paramName} (${category.name})`,
                  categoryName: category.name,
                  isDuplicate: true
                };
              }

              // First time seeing this parameter
              parameterNameTracker.add(uniqueIdentifier);
              return {
                ...param,
                categoryId: category.id,
                categoryName: category.name,
                originalName: paramName
              };
            });

            allParameters.push(...parametersWithCategoryId);
          }
        }

        // Sort parameters alphabetically by name
        const sortedParameters = [...allParameters].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setParameters(sortedParameters);
      } catch (err) {
        console.error('Error fetching parameters:', err);
        setError('Failed to load parameters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParametersForCategories();
  }, [selectedCategory]);

  // Filter parameters based on search query
  const filteredParameters = useMemo(() => {
    return parameters.filter(param => {
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const nameMatch = param.name?.toLowerCase().includes(query);
        const descMatch = param.description?.toLowerCase().includes(query);
        const typeMatch = param.type?.toLowerCase().includes(query);
        const categoryMatch = param.categoryName?.toLowerCase().includes(query);

        return nameMatch || descMatch || typeMatch || categoryMatch;
      }
      return true;
    });
  }, [parameters, debouncedSearchQuery]);

  // Handle adding a parameter
  const handleAddParameter = (parameter) => {
    onParameterSelect(parameter);
  };

  // Handle removing a parameter
  const handleRemoveParameter = (parameter) => {
    onParameterRemove(parameter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center space-y-2 py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading parameters...</p>
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

  if (!selectedCategory || selectedCategory.length === 0) {
    return (
      <Alert>
        <AlertDescription>Please select a category to see available parameters.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-bold">Set Parameters</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-3 flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 w-full rounded-md border border-input/60 bg-white px-2.5 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

        {/* View Toggle */}
        <div className="flex gap-2">
          <div className="bg-gray-100 rounded-md p-0.5 flex">
            <button
              onClick={() => setParameterView('category')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded ${parameterView === 'category'
                  ? 'bg-white shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-700'
                }`}
              title="Group by category"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setParameterView('list')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded ${parameterView === 'list'
                  ? 'bg-white shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-700'
                }`}
              title="View as list"
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
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

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-auto pr-1">
        {parameterView === 'category' ? (
          <>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Parameters by Category
            </h3>
            {selectedCategory.map(category => {
              // Get parameters for this category
              const categoryParameters = filteredParameters.filter(
                param => param.categoryId === category.id
              );

              // Skip rendering empty categories when there's a search query
              if (searchQuery && categoryParameters.length === 0) {
                return null;
              }

              return (
                <Accordion
                  key={category.id}
                  type="single"
                  defaultValue={category.id}
                  className="border-0 rounded-lg shadow-sm overflow-hidden bg-white"
                  collapsible="true"
                >
                  <AccordionItem value={category.id} className="border-0">
                    <AccordionTrigger className="py-1.5 px-2 text-xs font-medium hover:bg-gray-100 group transition-colors">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1">
                          <Badge className="text-[9px] px-1.5 py-px">
                            {category.name}
                          </Badge>
                        </div>
                        <span className="flex items-center text-[9px] bg-gray-50 text-foreground/80 px-1.5 py-0.5 rounded-md border border-border/60">
                          {categoryParameters.length || 0}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white/50 transition-colors">
                      <div className="p-1.5 space-y-1.5">
                        {categoryParameters.length > 0 ? (
                          categoryParameters.map(parameter => (
                            <MemoizedParameter
                              key={parameter.id}
                              parameter={parameter}
                              onAddParameter={handleAddParameter}
                            />
                          ))
                        ) : (
                          <div className="py-2 flex flex-col items-center justify-center text-center">
                            <p className="text-xs text-foreground/70">
                              No parameters available for this category.
                            </p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                All Parameters
              </h3>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredParameters.length} parameters
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 bg-white p-4 rounded-lg border border-border">
              {filteredParameters.map(parameter => (
                <MemoizedParameter
                  key={parameter.id}
                  parameter={parameter}
                  onAddParameter={handleAddParameter}
                />
              ))}

              {filteredParameters.length === 0 && !searchQuery && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <p className="text-foreground/70">
                    No parameters available.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Parameters;