// src/pages/SelectedParameters.jsx
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
import TipBanner from '../components/TipBanner';

// Parameter Value Input Component
const ParameterValueInput = ({ parameter, value, onChange }) => {
  switch (parameter.type) {
    case 'Dropdown':
      return (
        <div className="relative w-full">
          <Select
            value={value || parameter.values[0]?.id || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
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
          <div className="flex justify-between text-sm font-medium">
            {minLabel ? (
              <span className="text-sm">{minLabel}</span>
            ) : (
              <span className="text-secondary">{min}</span>
            )}
            {maxLabel ? (
              <span className="text-sm">{maxLabel}</span>
            ) : (
              <span className="text-secondary">{max}</span>
            )}
          </div>

          <div className="relative flex items-center h-6">
            <Slider
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onValueChange={(newValue) => onChange(newValue)}
              className="group w-full"
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
  const [showTip, setShowTip] = useState(true);
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
  }, [parameters]);

  if (!parameters.length) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-bold">Selected Parameters</h2>
        <div className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-h-[200px] text-center bg-background-muted">
          <p className="text-secondary mb-2">
            No parameters selected yet.
          </p>
          <p className="text-xs text-secondary max-w-sm">
            Browse the genres on the left, then add parameters from each genre
            to customize your story.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-2 py-1 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Selected Parameters</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRandomize('all')}
              className={`h-7 w-7 p-0 text-secondary ${
                randomizing ? 'animate-spin' : ''
              } focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1`}
              aria-label="Randomize all parameters"
            >
              <Dices className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium bg-accent/10 border-transparent text-accent px-2 py-0.5 rounded-md">
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

      <div className="flex-grow overflow-auto px-2">
        <Accordion
          type="multiple"
          defaultValue={parametersByCategory.map((cat) => cat.id)}
          className="divide-y divide-border max-h-[calc(100vh-300px)]"
        >
          {parametersByCategory.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
            >
              <AccordionTrigger className="px-2 py-0.5 hover:bg-background-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-secondary" />
                  <span className="font-medium text-sm">{category.name}</span>
                  <Badge className="text-[9px] px-1.5 py-px ml-2 bg-background-muted text-secondary">
                    {category.parameters.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-1">
                <div className="space-y-3 pt-1">
                  {category.parameters.map((parameter) => (
                    <div
                      key={parameter.id}
                      className="py-2 space-y-2 border-b border-border"
                    >
                      {/* Header with actions */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">
                            {parameter.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRandomize(
                                  'parameter',
                                  null,
                                  parameter.id
                                )
                              }
                              className={`h-7 w-7 p-0 text-secondary ${
                                randomizing ? 'animate-spin' : ''
                              } focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1`}
                              aria-label={`Randomize ${parameter.name}`}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Remove ${parameter.name}`}
                              onClick={() => onRemoveParameter(parameter)}
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {parameter.description && (
                          <p className="mt-1 text-sm text-secondary">
                            {parameter.description}
                          </p>
                        )}
                      </div>

                      {/* Value input */}
                      <div className="bg-background-muted p-2 rounded-md border border-border">
                        <ParameterValueInput
                          parameter={parameter}
                          value={parameter.value}
                          onChange={(newVal) =>
                            onUpdateParameterValue(parameter.id, newVal)
                          }
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

      <div className="flex-none px-2 py-1">
        <Button
          variant="default"
          size="lg"
          onClick={onNavigateToGenerate}
          disabled={!areAllConfigured}
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium border border-border py-1.5 text-sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          {!areAllConfigured
            ? 'Configure All Parameters First'
            : 'Generate Content'}
        </Button>
      </div>
    </div>
  );
};

export default SelectedParameters;