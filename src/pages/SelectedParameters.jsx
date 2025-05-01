import React from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Minus } from 'lucide-react';
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
              {/* Uncomment the line below if you want to show the numeric value */}
              {/* <div className="text-xs text-center text-muted-foreground mt-1">
                <span>Value: {currentValue}</span>
              </div> */}
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

const SelectedParameters = ({ 
  parameters, 
  onRemoveParameter,
  onUpdateParameterValue 
}) => {
  if (!parameters || parameters.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Selected Parameters</h2>
        <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-h-[200px] text-center bg-gray-50">
          <p className="text-muted-foreground">
            No parameters selected yet. 
            Add parameters from the list on the left.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Selected Parameters</h2>
        <span className="text-xs font-medium bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md">
          {parameters.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {parameters.map((parameter) => (
          <div 
            key={parameter.id} 
            className="bg-white p-3 rounded-md border border-border shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
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
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {parameter.description}
                  </p>
                )}
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onRemoveParameter(parameter)}
                className="h-7 px-2"
              >
                <Minus className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
            
            <div className="mt-2">
              <ParameterValueInput
                parameter={parameter}
                value={parameter.value}
                onChange={(newValue) => {
                  console.log('Updating parameter:', parameter.id, newValue);
                  onUpdateParameterValue(parameter.id, newValue);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedParameters;