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

// Helper component to render parameter value input based on type
const ParameterValueInput = ({ parameter, value, onChange }) => {
  switch (parameter.type) {
    case 'Dropdown':
      return (
        <Select 
          value={value || parameter.values[0]?.id || ''}
          onValueChange={(newValue) => {
            console.log('Dropdown value changed:', newValue);
            onChange(newValue);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value">
              {parameter.values.find(v => v.id === value)?.label || 'Select...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {parameter.values.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      return (
        <div>
          <Slider
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onValueChange={(newValue) => {
              const actualValue = Array.isArray(newValue) ? newValue[0] : newValue;
              console.log('Slider value changed:', actualValue);
              onChange(actualValue);
            }}
          />
          <div className="flex justify-between text-xs mt-1">
            <span>{min}</span>
            <span className="font-medium">{currentValue}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    
    case 'Toggle Switch':
      return (
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => {
            console.log('Switch value changed:', checked);
            onChange(checked);
          }}
        />
      );
    
    case 'Checkbox':
      return (
        <div className="space-y-2">
          {parameter.values.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                checked={(value || []).includes(option.id)}
                onCheckedChange={(checked) => {
                  const currentValue = value || [];
                  const newValue = checked
                    ? [...currentValue, option.id]
                    : currentValue.filter(v => v !== option.id);
                  
                  console.log('Checkbox value changed:', newValue);
                  onChange(newValue);
                }}
              />
              <label>{option.label}</label>
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
                  console.log('Radio value changed:', option.id);
                  onChange(option.id);
                }}
                className="h-4 w-4"
              />
              <label htmlFor={`${parameter.id}-${option.id}`}>{option.label}</label>
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