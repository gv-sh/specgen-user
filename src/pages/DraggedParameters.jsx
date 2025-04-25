import React, { useEffect, useState, useCallback, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { X, ArrowDown, PanelLeft, Move, List, Settings } from 'lucide-react';
import { Tooltip } from '../components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { stringToColor, getTypeColor } from '../utils/colorUtils';

// Memoized parameter card component
const ParameterCard = memo(({ param, onRemove, getCategoryColor }) => {
  // Skip rendering parameters with missing essential data
  if (!param || !param.id || !param.name) {
    console.error('Invalid parameter detected:', param);
    return null;
  }
  
  return (
    <div 
      className="flex items-center justify-between bg-white p-3 rounded-md border border-border shadow-sm gap-3 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div>
        <div className="flex items-center gap-1 flex-wrap">
          <Tooltip content={param.name}>
            <p className="font-medium text-sm truncate max-w-[120px]">{param.name}</p>
          </Tooltip>
          <div className="flex gap-1.5 flex-wrap">
            {param.categoryName && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${getCategoryColor(param.categoryName)}`}>
                {param.categoryName}
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-foreground/80 rounded-sm border border-border">
              {param.type}
            </span>
          </div>
        </div>
        <Tooltip content={param.description}>
          <p className="text-xs text-foreground/70 mt-1 line-clamp-2 max-w-[200px]">{param.description}</p>
        </Tooltip>
        {(param.value !== undefined && param.value !== null && param.value !== '') && (
          <div className="mt-2">
            <div className="text-xs font-medium text-muted-foreground mb-1">Value:</div>
            <div className="flex flex-wrap gap-1.5">
              {typeof param.value === 'object' ? (
                Array.isArray(param.value) ? (
                  param.value.length > 0 ? (
                    param.value.map((val, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-sm inline-block max-w-[100px] truncate">
                        {val.toString()}
                      </span>
                    ))
                  ) : <span className="text-xs bg-gray-100 text-foreground/70 px-1.5 py-0.5 rounded-sm">Empty array</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-foreground px-1.5 py-0.5 rounded-sm">
                    {JSON.stringify(param.value).slice(0, 30)}{JSON.stringify(param.value).length > 30 ? '...' : ''}
                  </span>
                )
              ) : (
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-sm font-medium">
                  {param.value.toString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          console.log('Removing parameter with ID:', param.id);
          onRemove(param.id);
        }}
        className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-border transition-colors group"
        title="Remove parameter"
      >
        <X size={14} className="group-hover:stroke-[2.5px]" />
      </button>
    </div>
  );
});

const DraggedParameters = ({ parameters, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-area'
  });
  
  // Generate color scheme for category badge - memoized for performance
  const getCategoryColor = useCallback((category) => {
    if (!category) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    const { bgColor, textColor, borderColor } = stringToColor(category);
    return `${bgColor} ${textColor} ${borderColor}`;
  }, []);
  
  // Ensure we display parameters correctly, with proper debug info
  useEffect(() => {
    if (parameters && parameters.length > 0) {
      console.log('Parameters in DraggedParameters (detailed):', 
        parameters.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          valueType: typeof p.value,
          valuePresent: p.value !== undefined && p.value !== null,
          value: p.value
        })));
    }
  }, [parameters]);
  
  // Animation variants for empty state
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (!parameters || parameters.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Selected Parameters</h2>
        <div 
          ref={setNodeRef}
          className={`
            p-4 border-2 border-dashed rounded-lg 
            flex flex-col items-center justify-center 
            min-h-[200px] transition-all duration-300
            ${isOver 
              ? 'border-primary bg-primary/10 shadow-lg scale-[1.02] ring-2 ring-primary/30 ring-offset-2' 
              : 'border-primary/30 bg-gray-50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'}
          `}
        >
          <AnimatePresence mode="wait">
            {isOver ? (
              <motion.div 
                key="drop-indicator"
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="text-center p-4"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-primary/30">
                  <Move className="text-primary w-10 h-10 animate-pulse" />
                </div>
                <h3 className="font-semibold text-primary text-xl mb-2">Drop Here!</h3>
                <p className="text-sm text-primary/80 max-w-[220px] bg-white/80 p-2 rounded-lg shadow-sm border border-primary/10">
                  Release to add this parameter to your specification
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty-state"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center p-4 max-w-xs"
              >
                <motion.div 
                  variants={itemVariants} 
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border-2 border-primary/20 shadow-md"
                >
                  <Settings className="text-primary/70 w-8 h-8" />
                </motion.div>
                <motion.h3 variants={itemVariants} className="font-semibold text-foreground text-lg mb-1">
                  No Parameters Selected
                </motion.h3>
                <motion.div 
                  variants={itemVariants} 
                  className="text-xs text-foreground/70 mb-5 bg-white p-2 rounded-lg shadow-sm border border-gray-100"
                >
                  <p>
                    Drag parameters from the left panel to add them to your specification
                  </p>
                  <div className="w-48 h-1 bg-primary/10 rounded-full mx-auto my-2"></div>
                  <p className="text-primary/80">Drop Zone Active</p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-center justify-center text-sm text-primary bg-primary/5 p-2 rounded-lg border border-primary/20">
                  <PanelLeft className="w-4 h-4 mr-1" /> 
                  <span>Select parameters</span>
                  <ArrowDown className="w-4 h-4 mx-1 animate-bounce" />
                  <span>Drag them here</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Make sure this div is always a droppable target
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center justify-between">
        <span>Selected Parameters</span>
        <span className="text-xs font-medium bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md">
          {parameters.length}
        </span>
      </h2>
      <div 
        ref={setNodeRef}
        className={`
          border-2 border-dashed rounded-lg p-3 
          min-h-[120px] transition-all duration-300
          ${isOver 
            ? 'border-primary bg-primary/10 shadow-lg scale-[1.02] ring-2 ring-primary/30 ring-offset-2' 
            : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'}
          relative
        `}
      >
        <AnimatePresence>
          {isOver && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg z-10"
            >
              <div className="bg-primary/20 border-2 border-primary/30 rounded-lg px-5 py-3 text-primary text-md font-medium shadow-md">
                <div className="flex items-center">
                  <div className="mr-3 bg-primary/30 p-2 rounded-full">
                    <Move className="w-5 h-5 animate-pulse" />
                  </div>
                  <span>Drop parameter here</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="space-y-2 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {parameters.map((param, index) => (
            <motion.div
              key={param.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <ParameterCard
                param={param}
                onRemove={onRemove}
                getCategoryColor={getCategoryColor}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {parameters.length > 0 && (
        <div className="text-xs text-center text-muted-foreground mt-2 bg-gray-50 rounded-md p-1.5 border border-border/50">
          <span className="flex items-center justify-center">
            <List className="w-3 h-3 inline mr-1" /> 
            Drag parameters from here to reorder or remove them
          </span>
        </div>
      )}
    </div>
  );
};

export default DraggedParameters;