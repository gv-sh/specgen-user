import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import DraggableParameter from '../components/DraggableParameter';
import ParameterCard from '../components/cards/ParameterCard';
import { fetchParameters } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectOption } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Search, Filter, Settings, SlidersHorizontal, List, X } from 'lucide-react';
import { stringToColor } from '../utils/colorUtils';
import { useScreenSize } from '../utils/responsiveUtils';
import { debounce } from '../utils/performanceUtils';

// Memoized parameter component for performance
const MemoizedParameter = memo(({ parameter, renderParameter }) => {
  return (
    <div className="mb-2 last:mb-0 hover:bg-gray-50 p-0.5 rounded-md transition-colors">
      {renderParameter(parameter)}
    </div>
  );
});

const Parameters = ({ selectedCategory }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [parameterValues, setParameterValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [contentType, setContentType] = useState('fiction');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [parameterView, setParameterView] = useState('category'); // 'category' or 'list'
  const [activeParameterId, setActiveParameterId] = useState(null);

  // Get screen size information for responsive design
  const { isMobile, isTablet } = useScreenSize();

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

        // Clear window.appState categories when no category is selected
        if (window.appState) {
          window.appState.categories = [];
        } else {
          window.appState = { categories: [] };
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const newParameterValues = { ...parameterValues }; // Clone existing values
        const allParameters = [];
        const parameterNameTracker = new Set(); // Track parameters by name to detect duplicates

        // Update global state with selected category IDs
        const categoryIds = selectedCategory.map(cat => cat.id);
        if (window.appState) {
          window.appState.categories = categoryIds;
        } else {
          window.appState = { categories: categoryIds };
        }

        // Fetch parameters for each selected category
        for (const category of selectedCategory) {
          const result = await fetchParameters(category.id);

          // Extract parameters from the data property in the API response
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
                  name: `${paramName} (${category.name})`, // Add category name for disambiguation
                  isDuplicate: true
                };
              }

              // First time seeing this parameter
              parameterNameTracker.add(uniqueIdentifier);
              return {
                ...param,
                categoryId: category.id,
                originalName: paramName
              };
            });

            allParameters.push(...parametersWithCategoryId);

            // Initialize parameter values only if they don't already exist
            if (!newParameterValues[category.id]) {
              newParameterValues[category.id] = {};
            }

            categoryParameters.forEach(param => {
              // Only set value if it doesn't already exist
              if (newParameterValues[category.id][param.id] === undefined) {
                switch (param.type) {
                  case 'Dropdown':
                    // Use ID instead of label - API expects the ID
                    newParameterValues[category.id][param.id] = param.values[0]?.id || '';
                    break;
                  case 'Radio':
                  case 'Radio Buttons': // Handle both variations
                    // For radio, we use the ID as well
                    newParameterValues[category.id][param.id] = param.values[0]?.id || '';
                    break;
                  case 'Slider':
                    newParameterValues[category.id][param.id] = param.config?.default || param.config?.min || 0;
                    break;
                  case 'Toggle Switch':
                    newParameterValues[category.id][param.id] = false;
                    break;
                  case 'Checkbox':
                    // For checkbox, we'll store an array of ids
                    newParameterValues[category.id][param.id] = [];
                    break;
                  default:
                    console.warn(`Unknown parameter type: ${param.type}`);
                    newParameterValues[category.id][param.id] = '';
                }
              }
            });
          }
        }

        // Sort parameters alphabetically by name
        const sortedParameters = [...allParameters].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setParameters(sortedParameters);
        setParameterValues(newParameterValues);
      } catch (err) {
        console.error('Error fetching parameters:', err);
        setError('Failed to load parameters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParametersForCategories();
  }, [selectedCategory]);

  // Handle parameter value changes
  const handleParameterChange = (categoryId, parameterId, newValue) => {
    const updatedValues = {
      ...parameterValues,
      [categoryId]: {
        ...parameterValues[categoryId],
        [parameterId]: newValue
      }
    };

    setParameterValues(updatedValues);

    // Update global state
    if (window.appState) {
      window.appState.parameters = updatedValues;
    } else {
      window.appState = { parameters: updatedValues };
    }

    // Clear validation error when value is updated
    if (validationErrors[parameterId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[parameterId];
        return newErrors;
      });
    }
  };

  // Handle content type change
  const handleContentTypeChange = (value) => {
    setContentType(value);

    // Store in global state so Generation component can access it
    if (window.appState) {
      window.appState.contentType = value;
    } else {
      window.appState = { contentType: value };
    }
  };

  // Render parameter component based on type
  const renderParameter = (parameter) => {
    const categoryId = parameter.categoryId;
    const value = parameterValues[categoryId]?.[parameter.id];
    const error = validationErrors[parameter.id];

    // Find the category name
    const category = selectedCategory.find(cat => cat.id === categoryId);
    const categoryName = category ? category.name : null;

    // Create data object for dragging
    const paramData = {
      id: parameter.id,
      name: parameter.name,
      description: parameter.description,
      categoryId: parameter.categoryId,
      categoryName,
      value: value
    };
    const renderParameterContent = () => {
      switch (parameter.type) {
        case 'Dropdown':
          return (
            <div className="space-y-1">
              <Select
                value={value || ''}
                onChange={(e) => handleParameterChange(categoryId, parameter.id, e.target.value)}
                className="w-full h-8 text-xs"
              >
                {parameter.values.map(option => (
                  <SelectOption key={option.id} value={option.id}>{option.label}</SelectOption>
                ))}
              </Select>

              {value && (
                <div className="flex items-center bg-gray-50 px-2 py-0.5 rounded text-xs">
                  <span className="text-[10px] text-gray-500 mr-1">Selected:</span>
                  <span className="text-[10px] text-primary font-medium">
                    {parameter.values.find(opt => opt.id === value)?.label || 'None'}
                  </span>
                </div>
              )}
            </div>
          );
        case 'Slider':
          const config = parameter.config || {};
          const min = config.min !== undefined ? config.min : 0;
          const max = config.max !== undefined ? config.max : 100;
          const step = config.step !== undefined ? config.step : 1;
          const currentValue = value !== null && value !== undefined ? value : (config?.default || min);

          return (
            <div className="space-y-1">
              <div className="py-0.5">
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={currentValue}
                  onChange={(newValue) => {
                    // Make sure we're passing a number, not an event
                    if (typeof newValue === 'number') {
                      handleParameterChange(categoryId, parameter.id, newValue);
                    } else if (newValue?.target?.value) {
                      // Fallback in case we get an event
                      handleParameterChange(categoryId, parameter.id, parseFloat(newValue.target.value));
                    }
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground bg-gray-100 px-1 py-0.5 rounded">{min}</span>
                <span className="font-medium bg-primary/10 text-primary px-1 py-0.5 rounded">{currentValue}</span>
                <span className="text-muted-foreground bg-gray-100 px-1 py-0.5 rounded">{max}</span>
              </div>
            </div>
          );
        case 'Toggle Switch':
          return (
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1">
                <span className="text-xs text-muted-foreground inline-block bg-gray-100 px-1.5 py-0.5 rounded-md">
                  {value === true ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleParameterChange(categoryId, parameter.id, e.target.checked)}
                className="h-5 w-9 appearance-none rounded-full bg-muted transition-colors relative
                          after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                          after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all
                          checked:bg-primary checked:after:translate-x-4"
              />
            </div>
          );
        case 'Radio':
        case 'Radio Buttons':
          return (
            <div className="grid grid-cols-2 gap-1 text-xs">
              {parameter.values.map(option => (
                <div
                  key={option.id}
                  className={`flex items-center p-1 rounded ${value === option.id ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50 border border-transparent'}`}
                >
                  <input
                    type="radio"
                    id={`${parameter.id}-${option.id}`}
                    name={parameter.id}
                    value={option.id}
                    checked={value === option.id}
                    onChange={() => handleParameterChange(categoryId, parameter.id, option.id)}
                    className="h-3 w-3 mr-1"
                  />
                  <label className="text-[10px] truncate" htmlFor={`${parameter.id}-${option.id}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );
        case 'Checkbox':
          const checkboxValues = Array.isArray(value) ? value : [];

          return (
            <div className="space-y-1">
              {checkboxValues.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {checkboxValues.map(selectedId => {
                    const option = parameter.values.find(o => o.id === selectedId);
                    return option ? (
                      <Badge key={option.id} className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1 py-0">
                        {option.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 gap-1 text-xs">
                {parameter.values.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-center p-1 rounded ${checkboxValues.includes(option.id) ? 'bg-primary/5 border border-primary/20' : 'bg-gray-50 border border-transparent'}`}
                  >
                    <input
                      type="checkbox"
                      id={`${parameter.id}-${option.id}`}
                      checked={checkboxValues.includes(option.id)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...checkboxValues, option.id]
                          : checkboxValues.filter(val => val !== option.id);
                        handleParameterChange(categoryId, parameter.id, newValues);
                      }}
                      className="h-3 w-3 mr-1"
                    />
                    <label className="text-[10px] truncate" htmlFor={`${parameter.id}-${option.id}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        default:
          return (
            <div className="text-sm bg-red-50 p-2 border border-red-100 rounded-md text-red-600">
              Unknown parameter type: {parameter.type}
            </div>
          );
      }
    };

    // Wrap parameter content in draggable component with the unified card design
    return (
      <DraggableParameter id={parameter.id} data={paramData}>
        <ParameterCard
          name={parameter.name}
          description={parameter.description}
          categoryName={categoryName}
          error={error}
          parameter={parameter}
        >
          {renderParameterContent()}
        </ParameterCard>
      </DraggableParameter>
    );
  };

  // Memoize the filtered parameters to avoid unnecessary re-filtering
  const filteredParameters = useMemo(() => {
    return parameters.filter(param => {
      // Apply search filter
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const nameMatch = param.name?.toLowerCase().includes(query);
        const descMatch = param.description?.toLowerCase().includes(query);
        const typeMatch = param.type?.toLowerCase().includes(query);

        if (!nameMatch && !descMatch && !typeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [parameters, debouncedSearchQuery]);

  // Memoize parameters by category for better performance
  const parametersByCategory = useMemo(() => {
    const result = {};

    if (selectedCategory) {
      selectedCategory.forEach(category => {
        result[category.id] = filteredParameters.filter(param => param.categoryId === category.id);
      });
    }

    return result;
  }, [filteredParameters, selectedCategory]);

  // Get category badge color - memoized for performance
  const getCategoryBadgeColor = useCallback((categoryName) => {
    if (!categoryName) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    // Generate colors based on the category name
    const { bgColor, textColor, borderColor } = stringToColor(categoryName);
    return `${bgColor} ${textColor} ${borderColor}`;
  }, []);

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

      {/* Content Type Selection - Enhanced */}
      <div className="mb-3 p-2.5 border border-border/70 rounded-md bg-white shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-primary/80" />
              <span>Content Type</span>
            </label>
            <div className="px-1.5 py-0.5 bg-gray-50 rounded-full text-xs text-muted-foreground border border-border/40">
              {selectedCategory.length} categories
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-1 rounded-md border border-border/40">
            <div className="flex flex-1 divide-x divide-border/50">
              <div
                className={`flex items-center px-2.5 py-0.5 rounded-l-sm cursor-pointer transition-colors ${contentType === "fiction" ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                onClick={() => handleContentTypeChange("fiction")}
              >
                <input
                  type="radio"
                  id="fiction"
                  name="contentType"
                  value="fiction"
                  checked={contentType === "fiction"}
                  onChange={() => handleContentTypeChange("fiction")}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="fiction" className="text-xs cursor-pointer">Fiction</label>
              </div>

              <div
                className={`flex items-center px-2.5 py-0.5 cursor-pointer transition-colors ${contentType === "image" ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                onClick={() => handleContentTypeChange("image")}
              >
                <input
                  type="radio"
                  id="image"
                  name="contentType"
                  value="image"
                  checked={contentType === "image"}
                  onChange={() => handleContentTypeChange("image")}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="image" className="text-xs cursor-pointer">Image</label>
              </div>

              <div
                className={`flex items-center px-2.5 py-0.5 rounded-r-sm cursor-pointer transition-colors ${contentType === "combined" ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                onClick={() => handleContentTypeChange("combined")}
              >
                <input
                  type="radio"
                  id="combined"
                  name="contentType"
                  value="combined"
                  checked={contentType === "combined"}
                  onChange={() => handleContentTypeChange("combined")}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="combined" className="text-xs cursor-pointer">Combined</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
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

      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Please fix the errors below before continuing.
          </AlertDescription>
        </Alert>
      )}

      {/* Instruction to drag parameters */}
      <div className="mb-2">
        <div className="flex justify-between items-center bg-blue-50 p-2 rounded-md border border-blue-100">
          <p className="text-xs text-blue-700 flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
            Drag parameters to "Selected Parameters"
          </p>
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
          /* Category View */
          <>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Parameters by Category</h3>
            {selectedCategory.map(category => {
              // Get parameters for this category
              const categoryParameters = filteredParameters.filter(param => param.categoryId === category.id);

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
                          <Badge className={`text-[9px] px-1.5 py-px h-4 ${getCategoryBadgeColor(category.name)}`}>
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
                              renderParameter={renderParameter}
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
          /* List View */
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">All Parameters</h3>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredParameters.length} parameters
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 bg-white p-4 rounded-lg border border-border">
              {filteredParameters.map(parameter => (
                <MemoizedParameter
                  key={parameter.id}
                  parameter={parameter}
                  renderParameter={renderParameter}
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