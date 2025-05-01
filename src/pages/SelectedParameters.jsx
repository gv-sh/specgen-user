// src/pages/SelectedParameters.jsx - Fixed with ParameterValueInput included
import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Minus, Folder, Zap, Dices, Wand, RefreshCw } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../components/ui/accordion';
import { Tooltip } from '../components/ui/tooltip';
import TipBanner from '../components/TipBanner';

// Parameter Value Input Component
const ParameterValueInput = ({ parameter, value, onChange }) => {
  switch (parameter.type) {
    case 'Dropdown':
      return (
        <div className="relative w-full">
          <Select
            value={value || parameter.values[0]?.id || ''}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="" disabled>Select...</option>
            {parameter.values.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      );
    
    case 'Slider':
      const config = parameter.config || {};
      const min = config.min !== undefined ? config.min : 0;
      const max = config.max !== undefined ? config.max : 100;
      const step = config.step !== undefined ? config.step : 1;
      
      // Ensure a default value is set
      const defaultValue = config.default !== undefined 
        ? config.default 
        : min;
      
      // Use the current value or default
      const currentValue = value !== undefined 
        ? value 
        : defaultValue;
      
      // Get the labels for the min and max values (if available)
      const minLabel = parameter.values && parameter.values[0]?.label;
      const maxLabel = parameter.values && parameter.values[1]?.label;

      return (
        <div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              {minLabel ? (
                <span>{minLabel}</span>
              ) : (
                <span className="text-muted-foreground">{min}</span>
              )}
              {maxLabel ? (
                <span>{maxLabel}</span>
              ) : (
                <span className="text-muted-foreground">{max}</span>
              )}
            </div>
            
            <div className="relative">
              <Slider
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onValueChange={(newValue) => {
                  onChange(newValue);
                }}
                className="group"
              />
            </div>
          </div>
        </div>
      );
    
    case 'Toggle Switch':
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => {
              onChange(checked);
            }}
          />
        </div>
      );
    
    case 'Checkbox':
      return (
        <div className="space-y-2">
          {parameter.values.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`checkbox-${parameter.id}-${option.id}`}
                checked={(value || []).includes(option.id)}
                onCheckedChange={(checked) => {
                  const currentValue = value || [];
                  const newValue = checked
                    ? [...currentValue, option.id]
                    : currentValue.filter(v => v !== option.id);
                  
                  onChange(newValue);
                }}
              />
              <label htmlFor={`checkbox-${parameter.id}-${option.id}`} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      );
    
    case 'Radio':
    case 'Radio Buttons':
      return (
        <div className="space-y-2">
          {parameter.values.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${parameter.id}-${option.id}`}
                name={parameter.id}
                value={option.id}
                checked={value === option.id}
                onChange={() => {
                  onChange(option.id);
                }}
                className="h-4 w-4"
              />
              <label htmlFor={`${parameter.id}-${option.id}`} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      );
    
    default:
      return <div>Unsupported parameter type: {parameter.type}</div>;
  }
};

// Function to generate a random value for a parameter based on its type
const randomizeParameterValue = (parameter) => {
  switch (parameter.type) {
    case 'Dropdown':
    case 'Radio':
    case 'Radio Buttons':
      // Randomly select one option from the values array
      if (parameter.values && parameter.values.length > 0) {
        const randomIndex = Math.floor(Math.random() * parameter.values.length);
        return parameter.values[randomIndex].id;
      }
      return null;
    
    case 'Slider':
      // Generate a random number within the slider's range
      const config = parameter.config || {};
      const min = config.min !== undefined ? config.min : 0;
      const max = config.max !== undefined ? config.max : 100;
      const step = config.step !== undefined ? config.step : 1;
      
      // Calculate how many steps fit in the range
      const stepsInRange = Math.floor((max - min) / step);
      // Generate a random step count
      const randomSteps = Math.floor(Math.random() * (stepsInRange + 1));
      // Calculate the value from the random step count
      return min + (randomSteps * step);
    
    case 'Toggle Switch':
      // 50% chance of true or false
      return Math.random() >= 0.5;
    
    case 'Checkbox':
      // Randomly decide how many checkboxes to select (0 to all)
      if (parameter.values && parameter.values.length > 0) {
        const result = [];
        
        // For each checkbox, randomly decide whether to include it
        parameter.values.forEach(value => {
          if (Math.random() >= 0.5) {
            result.push(value.id);
          }
        });
        
        // Ensure at least one checkbox is selected if there are options
        if (result.length === 0 && parameter.values.length > 0) {
          const randomIndex = Math.floor(Math.random() * parameter.values.length);
          result.push(parameter.values[randomIndex].id);
        }
        
        return result;
      }
      return [];
    
    default:
      return null;
  }
};

const SelectedParameters = ({ 
  parameters, 
  onRemoveParameter,
  onUpdateParameterValue,
  onNavigateToGenerate 
}) => {
  const [showTip, setShowTip] = useState(true);
  const [randomizing, setRandomizing] = useState(false);
  
  // Group parameters by category
  const parametersByCategory = useMemo(() => {
    const grouped = {};
    
    // Iterate through parameters in reverse to add newest first
    // We'll reverse the array to process the most recently added parameters first
    [...parameters].reverse().forEach(param => {
      const categoryId = param.categoryId || 'uncategorized';
      const categoryName = param.categoryName || 'Uncategorized';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          id: categoryId,
          name: categoryName,
          parameters: []
        };
      }
      
      // Add to the beginning of the array to keep newest at the top
      grouped[categoryId].parameters.unshift(param);
    });
    
    return Object.values(grouped);
  }, [parameters]);

  // Check if all parameters have values
  const areAllParametersConfigured = useMemo(() => {
    if (parameters.length === 0) return false;
    
    return !parameters.some(param => 
      param.value === undefined || param.value === null
    );
  }, [parameters]);
  
  // Handle randomization of parameters
  const handleRandomize = (scope, categoryId = null, parameterId = null) => {
    setRandomizing(true);
    
    // Small delay to show animation
    setTimeout(() => {
      switch (scope) {
        case 'parameter':
          // Randomize a single parameter
          if (parameterId) {
            const param = parameters.find(p => p.id === parameterId);
            if (param) {
              const newValue = randomizeParameterValue(param);
              onUpdateParameterValue(param.id, newValue);
            }
          }
          break;
        
        case 'category':
          // Randomize all parameters in a specific category
          if (categoryId) {
            parameters
              .filter(p => p.categoryId === categoryId)
              .forEach(param => {
                const newValue = randomizeParameterValue(param);
                onUpdateParameterValue(param.id, newValue);
              });
          }
          break;
        
        case 'all':
          // Randomize all parameters
          parameters.forEach(param => {
            const newValue = randomizeParameterValue(param);
            onUpdateParameterValue(param.id, newValue);
          });
          break;
      }
      
      setRandomizing(false);
    }, 300);
  };
  
  // Auto-randomize parameters that don't have values yet
  useEffect(() => {
    // Find parameters without values
    const unconfiguredParams = parameters.filter(
      param => param.value === undefined || param.value === null
    );
    
    // Randomize each unconfigured parameter
    unconfiguredParams.forEach(param => {
      const newValue = randomizeParameterValue(param);
      onUpdateParameterValue(param.id, newValue);
    });
  }, [parameters]);

  if (!parameters || parameters.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-bold">Selected Parameters</h2>
        <div className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-h-[200px] text-center bg-gray-50">
          <p className="text-muted-foreground mb-2">
            No parameters selected yet.
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Browse the genres on the left, then add parameters from each genre to customize your story.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Selected Parameters</h2>
          <div className="flex items-center gap-2">
            <Tooltip content="Randomize all parameters" position="left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRandomize('all')}
                className={`h-7 w-7 p-0 text-muted-foreground ${randomizing ? 'animate-spin' : ''}`}
                aria-label="Randomize all parameters"
              >
                <Dices className="h-4 w-4" />
              </Button>
            </Tooltip>
            <span className="text-xs font-medium bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md">
              {parameters.length}
            </span>
          </div>
        </div>
        
        {showTip && (
          <TipBanner 
            message="Configure the selected parameters below to customize your generated story. Mix parameters from different genres for more creative results."
            onClose={() => setShowTip(false)}
          />
        )}
      </div>
      
      {/* Parameters section - using flex-grow to take available space */}
      <div className="flex-grow overflow-auto p-4 pt-0">
        <div className="space-y-4 max-h-[calc(100vh-300px)]">
          <Accordion 
            type="multiple" 
            defaultValue={parametersByCategory.map(cat => cat.id)}
            className="space-y-3"
          >
            {parametersByCategory.map((category) => (
              <AccordionItem 
                key={category.id} 
                value={category.id}
                className="border border-border/60 rounded-lg overflow-hidden bg-white shadow-sm"
              >
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{category.name}</span>
                    <Badge className="text-[9px] px-1.5 py-px ml-2 bg-gray-100 text-gray-700">
                      {category.parameters.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="space-y-3 pt-1">
                    {category.parameters.map((parameter) => (
                      <div 
                        key={parameter.id} 
                        className="bg-white p-3 rounded-md border border-border/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-2">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className="font-medium text-sm">{parameter.name}</h3>
                            </div>
                            {parameter.description && (
                              <p className="text-xs text-muted-foreground mb-1.5">
                                {parameter.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip content={`Randomize ${parameter.name}`} position="top">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRandomize('parameter', null, parameter.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                aria-label={`Randomize ${parameter.name}`}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onRemoveParameter(parameter)}
                              className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Minus className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 bg-gray-50 p-2 rounded-md border border-border/40">
                          <ParameterValueInput
                            parameter={parameter}
                            value={parameter.value}
                            onChange={(newValue) => {
                              onUpdateParameterValue(parameter.id, newValue);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      
      {/* Generate button - moved to the bottom with flex-none to prevent stretching */}
      <div className="flex-none p-4 pt-2">
        <Button 
          variant="default"
          size="lg"
          onClick={onNavigateToGenerate}
          disabled={!areAllParametersConfigured || parameters.length === 0}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-900 shadow-sm transition-colors py-1.5 text-sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          {!areAllParametersConfigured 
            ? "Configure All Parameters First" 
            : parameters.length === 0 
              ? "Select Parameters First" 
              : "Generate Content"}
        </Button>
      </div>
    </div>
  );
};

export default SelectedParameters;