// src/components/ui/slider.jsx - Completely revised implementation
import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100, 
  step = 1, 
  value, 
  onValueChange, 
  ...props 
}, ref) => {
  // Ensure value is always a number for internal use
  const currentValue = Array.isArray(value) 
    ? value[0] 
    : (value !== undefined ? value : min);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary/20 
        [&::-webkit-slider-runnable-track]:h-1.5 
        [&::-webkit-slider-runnable-track]:rounded-full 
        [&::-webkit-slider-runnable-track]:bg-primary/20 
        [&::-webkit-slider-thumb]:appearance-none 
        [&::-webkit-slider-thumb]:h-4 
        [&::-webkit-slider-thumb]:w-4 
        [&::-webkit-slider-thumb]:rounded-full 
        [&::-webkit-slider-thumb]:bg-primary 
        [&::-webkit-slider-thumb]:transition-all 
        [&::-moz-range-track]:h-1.5 
        [&::-moz-range-track]:rounded-full 
        [&::-moz-range-track]:bg-primary/20 
        [&::-moz-range-thumb]:h-4 
        [&::-moz-range-thumb]:w-4 
        [&::-moz-range-thumb]:rounded-full 
        [&::-moz-range-thumb]:bg-primary 
        [&::-moz-range-thumb]:border-none 
        focus-visible:outline-none 
        focus-visible:ring-1 
        focus-visible:ring-ring 
        disabled:pointer-events-none 
        disabled:opacity-50"
        {...props}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }