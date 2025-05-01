// src/pages/SelectedParameters.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Minus, Folder, Zap, Dices, RefreshCw } from 'lucide-react';
import { Select } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../components/ui/accordion';
import { cn } from '../lib/utils';

// Parameter Value Input Component
const ParameterValueInput = ({ parameter, value, onChange }) => {
  switch (parameter.type) {
    case 'Dropdown':
      return (
        <div className="relative w-full">
          <Select
            value={value || parameter.values[0]?.id || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
          >
            <option value="" disabled>
              Select...
            </option>
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
      const min = config.min ?? 0;
      const max = config.max ?? 100;
      const step = config.step ?? 1;
      const defaultValue = config.default ?? min;
      const currentValue = value ?? defaultValue;
      const minLabel = parameter.values?.[0]?.label;
      const maxLabel = parameter.values?.[1]?.label;

      return (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {minLabel ? (
              <span className="text-xs">{minLabel}</span>
            ) : (
              <span className="text-xs text-muted-foreground">{min}</span>
            )}
            {maxLabel ? (
              <span className="text-xs">{maxLabel}</span>
            ) : (
              <span className="text-xs text-muted-foreground">{max}</span>
            )}
          </div>

          <div className="relative flex items-center h-6">
            <Slider
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onValueChange={(newValue) => onChange(newValue)}
              className="w-full"
            />
          </div>
        </div>
      );

    case 'Toggle Switch':
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );

    case 'Checkbox':
      return (
        <div className="grid grid-cols-2 gap-2">
          {parameter.values.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`checkbox-${parameter.id}-${option.id}`}
                checked={(value || []).includes(option.id)}
                onCheckedChange={(checked) => {
                  const currentValue = value || [];
                  const newValue = checked
                    ? [...currentValue, option.id]
                    : currentValue.filter((v) => v !== option.id);
                  onChange(newValue);
                }}
              />
              <label
                htmlFor={`checkbox-${parameter.id}-${option.id}`}
                className="text-sm"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      );

    case 'Radio':
    case 'Radio Buttons':
      return (
        <div className="grid grid-cols-2 gap-2">
          {parameter.values.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${parameter.id}-${option.id}`}
                name={parameter.id}
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="h-4 w-4"
              />
              <label
                htmlFor={`${parameter.id}-${option.id}`}
                className="text-sm"
              >
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
      if (parameter.values?.length) {
        const idx = Math.floor(Math.random() * parameter.values.length);
        return parameter.values[idx].id;
      }
      return null;

    case 'Slider': {
      const config = parameter.config || {};
      const min = config.min ?? 0;
      const max = config.max ?? 100;
      const step = config.step ?? 1;
      const steps = Math.floor((max - min) / step);
      const randomSteps = Math.floor(Math.random() * (steps + 1));
      return min + randomSteps * step;
    }

    case 'Toggle Switch':
      return Math.random() >= 0.5;

    case 'Checkbox': {
      if (parameter.values?.length) {
        const result = [];
        parameter.values.forEach((opt) => {
          if (Math.random() >= 0.5) result.push(opt.id);
        });
        if (!result.length) {
          const idx = Math.floor(Math.random() * parameter.values.length);
          result.push(parameter.values[idx].id);
        }
        return result;
      }
      return [];
    }

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
  const [randomizing, setRandomizing] = useState(false);

  // Group and reverse for newest first
  const parametersByCategory = useMemo(() => {
    const grouped = {};
    [...parameters].reverse().forEach((param) => {
      const catId = param.categoryId || 'uncategorized';
      const catName = param.categoryName || 'Uncategorized';
      if (!grouped[catId]) {
        grouped[catId] = { id: catId, name: catName, parameters: [] };
      }
      grouped[catId].parameters.unshift(param);
    });
    return Object.values(grouped);
  }, [parameters]);

  const areAllConfigured = useMemo(() => {
    if (!parameters.length) return false;
    return !parameters.some((p) => p.value == null);
  }, [parameters]);

  const handleRandomize = (scope, categoryId = null, parameterId = null) => {
    setRandomizing(true);
    setTimeout(() => {
      if (scope === 'parameter' && parameterId) {
        const p = parameters.find((x) => x.id === parameterId);
        if (p) onUpdateParameterValue(p.id, randomizeParameterValue(p));
      }
      if (scope === 'category' && categoryId) {
        parameters
          .filter((x) => x.categoryId === categoryId)
          .forEach((p) =>
            onUpdateParameterValue(p.id, randomizeParameterValue(p))
          );
      }
      if (scope === 'all') {
        parameters.forEach((p) =>
          onUpdateParameterValue(p.id, randomizeParameterValue(p))
        );
      }
      setRandomizing(false);
    }, 300);
  };

  useEffect(() => {
    parameters
      .filter((p) => p.value == null)
      .forEach((p) =>
        onUpdateParameterValue(p.id, randomizeParameterValue(p))
      );
  }, [onUpdateParameterValue, parameters]);

  if (!parameters.length) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-sm font-medium pb-3 text-foreground">Selected Parameters</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-sm font-medium mb-2">No parameters selected yet.</p>
            <p className="text-xs text-muted-foreground">
              Browse the genres on the left, then add parameters from each genre
              to customize your story.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Selected Parameters</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRandomize('all')}
              className={cn(
                "h-7 w-7",
                randomizing ? "animate-spin" : ""
              )}
              aria-label="Randomize all parameters"
            >
              <Dices className="h-3.5 w-3.5" />
            </Button>
            <Badge variant="outline">{parameters.length}</Badge>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <Accordion
          type="multiple"
          defaultValue={parametersByCategory.map((cat) => cat.id)}
          className="space-y-3"
        >
          {parametersByCategory.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-md px-3"
            >
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {category.parameters.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 py-2">
                  {category.parameters.map((parameter) => (
                    <div
                      key={parameter.id}
                      className="space-y-2 pb-3 border-b last:border-0 last:pb-0"
                    >
                      {/* Parameter header with actions */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{parameter.name}</h3>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRandomize('parameter', null, parameter.id)}
                            className="h-6 w-6"
                            aria-label={`Randomize ${parameter.name}`}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveParameter(parameter)}
                            className="h-6 w-6 text-destructive"
                            aria-label={`Remove ${parameter.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {parameter.description && (
                        <p className="text-xs text-muted-foreground">
                          {parameter.description}
                        </p>
                      )}

                      {/* Value input */}
                      <div className="p-3 bg-muted/40 rounded-md">
                        <ParameterValueInput
                          parameter={parameter}
                          value={parameter.value}
                          onChange={(newVal) => onUpdateParameterValue(parameter.id, newVal)}
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

      <div className="pt-3">
        <Button
          variant="default"
          onClick={onNavigateToGenerate}
          disabled={!areAllConfigured}
          className="w-full"
        >
          <Zap className="h-3.5 w-3.5 mr-2" />
          {!areAllConfigured
            ? 'Configure All Parameters First'
            : 'Generate Content'}
        </Button>
      </div>
    </div>
  );
};

export default SelectedParameters;