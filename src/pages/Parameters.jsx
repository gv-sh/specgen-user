import React, { useState, useEffect } from 'react';
import DraggableParameter from '../components/DraggableParameter';
import { fetchParameters } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tooltip } from '../components/ui/tooltip';
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

const Parameters = ({ selectedCategory }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [parameterValues, setParameterValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [contentType, setContentType] = useState('fiction');
  
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
        const newParameterValues = {...parameterValues}; // Clone existing values
        const allParameters = [];
        
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
            // Add categoryId to each parameter for reference
            const parametersWithCategoryId = categoryParameters.map(param => ({
              ...param,
              categoryId: category.id
            }));
            
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
        
        setParameters(allParameters);
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
        const newErrors = {...prev};
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
    
    // Create data object for dragging
    const paramData = {
      id: parameter.id,
      name: parameter.name,
      description: parameter.description,
      type: parameter.type,
      categoryId: parameter.categoryId,
      value: value
    };
    
    const renderParameterContent = () => {
      switch (parameter.type) {
      case 'Dropdown':
        return (
          <div className="space-y-1">
            <div>
              <label className="text-sm font-medium">{parameter.name}</label>
              {parameter.description && (
                <Tooltip content={parameter.description}>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{parameter.description}</p>
                </Tooltip>
              )}
            </div>
            <Select
              value={value || ''}
              onChange={(e) => handleParameterChange(categoryId, parameter.id, e.target.value)}
              className="w-full"
            >
              {parameter.values.map(option => (
                <SelectOption key={option.id} value={option.id}>{option.label}</SelectOption>
              ))}
            </Select>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );
      case 'Slider':
        const config = parameter.config || {};
        const min = config.min !== undefined ? config.min : 0;
        const max = config.max !== undefined ? config.max : 100;
        const step = config.step !== undefined ? config.step : 1;
        
        return (
          <div className="space-y-1">
            <div>
              <label className="text-sm font-medium">{parameter.name}</label>
              {parameter.description && (
                <Tooltip content={parameter.description}>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{parameter.description}</p>
                </Tooltip>
              )}
            </div>
            <div className="pt-1 pb-0.5">
              <Slider 
                min={min}
                max={max}
                step={step}
                value={value !== null ? value : (config?.default || min)}
                onChange={(val) => handleParameterChange(categoryId, parameter.id, val)}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{min}</span>
              <span className="text-xs font-medium">{value !== null ? value : (config?.default || min)}</span>
              <span className="text-xs text-muted-foreground">{max}</span>
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );
      case 'Toggle Switch':
        return (
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <label className="text-sm font-medium">{parameter.name}</label>
              {parameter.description && (
                <Tooltip content={parameter.description}>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{parameter.description}</p>
                </Tooltip>
              )}
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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
          <div className="space-y-1">
            <div>
              <label className="text-sm font-medium">{parameter.name}</label>
              {parameter.description && (
                <Tooltip content={parameter.description}>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{parameter.description}</p>
                </Tooltip>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {parameter.values.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${parameter.id}-${option.id}`}
                    name={parameter.id}
                    value={option.id}
                    checked={value === option.id}
                    onChange={() => handleParameterChange(categoryId, parameter.id, option.id)}
                    className="h-4 w-4 rounded-full border border-primary text-primary"
                  />
                  <label className="text-sm" htmlFor={`${parameter.id}-${option.id}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );
      case 'Checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        
        return (
          <div className="space-y-1">
            <div>
              <label className="text-sm font-medium">{parameter.name}</label>
              {parameter.description && (
                <Tooltip content={parameter.description}>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{parameter.description}</p>
                </Tooltip>
              )}
            </div>
            <div className="space-y-1 grid grid-cols-2">
              {parameter.values.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
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
                    className="h-4 w-4 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <label className="text-sm" htmlFor={`${parameter.id}-${option.id}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );
      default:
        return (
          <div className="text-sm text-destructive">
            Unknown parameter type: {parameter.type}
          </div>
        );
      }
    };
    
    // Wrap parameter content in draggable component
    return (
      <DraggableParameter id={parameter.id} data={paramData}>
        {renderParameterContent()}
      </DraggableParameter>
    );
  };
  
  // Group parameters by category
  const parametersByCategory = {};
  if (selectedCategory) {
    selectedCategory.forEach(category => {
      parametersByCategory[category.id] = parameters.filter(param => param.categoryId === category.id);
    });
  }
  
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
    <div className="space-y-3">
      <div className="mb-2">
        <h2 className="text-lg font-bold">Set Parameters</h2>
      </div>
      
      {/* Content Type Selection - Compact */}
      <div className="mb-3 p-2 border border-border rounded-md bg-gray-50">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Type:</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="fiction"
                name="contentType"
                value="fiction"
                checked={contentType === "fiction"}
                onChange={() => handleContentTypeChange("fiction")}
                className="h-3 w-3 mr-1 text-gray-800 border-gray-300"
              />
              <label htmlFor="fiction" className="text-xs">Fiction</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="image"
                name="contentType"
                value="image"
                checked={contentType === "image"}
                onChange={() => handleContentTypeChange("image")}
                className="h-3 w-3 mr-1 text-gray-800 border-gray-300"
              />
              <label htmlFor="image" className="text-xs">Image</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="combined"
                name="contentType"
                value="combined"
                checked={contentType === "combined"}
                onChange={() => handleContentTypeChange("combined")}
                className="h-3 w-3 mr-1 text-gray-800 border-gray-300"
              />
              <label htmlFor="combined" className="text-xs">Combined</label>
            </div>
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
      
      <div className="mb-2">
        <p className="text-xs text-foreground/70 italic">Drag any parameter to "Selected Parameters" to build your specification</p>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-auto pr-1">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Parameters by Category</h3>
        {selectedCategory.map(category => (
          <Accordion key={category.id} type="single" defaultValue={category.id} className="border-0 rounded-lg shadow-sm overflow-hidden bg-white" collapsible="true">
            <AccordionItem value={category.id} className="border-0">
              <AccordionTrigger className="py-2 px-3 text-sm font-medium hover:bg-gray-100 group transition-colors">
                <div className="flex justify-between items-center w-full pr-1">
                  <span>{category.name}</span>
                  <span className="flex items-center text-xs font-medium bg-gray-100 text-foreground px-1.5 py-0.5 rounded-md border border-border">
                    {parametersByCategory[category.id]?.length || 0}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white/50 transition-colors">
                <div className="p-2 space-y-3 divide-y divide-border/40">
                  {parametersByCategory[category.id]?.length > 0 ? (
                    parametersByCategory[category.id].map(parameter => (
                      <div key={parameter.id} className="pt-2 first:pt-0 hover:bg-gray-100 p-1 rounded-md transition-colors">
                        {renderParameter(parameter)}
                      </div>
                    ))
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                      <p className="text-foreground/70">
                        No parameters available for this category.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default Parameters;