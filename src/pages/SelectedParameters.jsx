// src/pages/SelectedParameters.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Minus, Folder, Zap, Dices, RefreshCw, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../components/ui/accordion';
import { cn } from '../lib/utils';
import ParameterValueInput from '../components/parameters/ParameterValueInput';
import YearInput from '../components/parameters/YearInput';
import { randomizeParameterValue } from '../utils/parameterUtils';

const SelectedParameters = ({
  parameters,
  onRemoveParameter,
  onUpdateParameterValue,
  onNavigateToGenerate
}) => {
  const [randomizing, setRandomizing] = useState(false);
  const [storyYear, setStoryYear] = useState(() => {
    // Generate a random year between 2050 and 2150
    return Math.floor(Math.random() * (2150 - 2050 + 1)) + 2050;
  });
  
  // Function to remove all parameters at once
  const handleRemoveAll = () => {
    // Call onRemoveParameter for each parameter
    [...parameters].forEach(param => {
      onRemoveParameter(param);
    });
  };

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
      <div className="sticky top-0 z-10 bg-card pb-3">
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
              title="Randomize all parameters"
            >
              <Dices className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveAll}
              className="h-7 w-7 text-destructive"
              aria-label="Remove all parameters"
              title="Remove all parameters"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Badge variant="outline">{parameters.length}</Badge>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto" style={{ height: "calc(100% - 96px)" }}>
        <div className="space-y-2">
          {parametersByCategory.map((category) => (
            <div 
              key={category.id}
              className="border border-input rounded-md overflow-hidden"
            >
              <Accordion
                type="multiple"
                defaultValue={[category.id]}
                className="w-full"
              >
                <AccordionItem
                  value={category.id}
                  className="border-none"
                >
                  <AccordionTrigger className="py-1 px-3 h-9 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{category.name}</span>
                      <Badge variant="outline" className="ml-1 text-xs">
                        {category.parameters.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-1 pb-2">
                    <div className="space-y-0">
                      {category.parameters.map((parameter, paramIndex) => (
                        <div
                          key={parameter.id}
                          className={cn(
                            "py-3",
                            paramIndex !== 0 ? "border-t border-input" : ""
                          )}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">{parameter.name}</h3>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRandomize('parameter', null, parameter.id)}
                                  className="h-6 w-6"
                                  aria-label={`Randomize ${parameter.name}`}
                                  title={`Randomize ${parameter.name}`}
                                >
                                  <Dices className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemoveParameter(parameter)}
                                  className="h-6 w-6 text-destructive"
                                  aria-label={`Remove ${parameter.name}`}
                                  title={`Remove ${parameter.name}`}
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
                            <div className="p-3 bg-muted/40 rounded-md border border-input">
                              <ParameterValueInput
                                parameter={parameter}
                                value={parameter.value}
                                onChange={(newVal) => onUpdateParameterValue(parameter.id, newVal)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>

      {/* Year Selection */}
      <div className="mb-4 mt-2">
        <YearInput 
          value={storyYear} 
          onChange={setStoryYear} 
        />
      </div>
      
      <div className="sticky bottom-0 py-3 border-t border-input bg-card z-10 mt-auto">
        <Button
          variant="default"
          onClick={() => {
            // Pass the storyYear when navigating to library
            sessionStorage.setItem('specgen-story-year', storyYear.toString());
            // Also set a flag to indicate we should generate content on library page load
            sessionStorage.setItem('specgen-auto-generate', 'true');
            onNavigateToGenerate();
          }}
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