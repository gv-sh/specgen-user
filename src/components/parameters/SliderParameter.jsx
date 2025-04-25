import React from 'react';
import {
  Box,
  Slider,
  Typography,
  FormHelperText,
  Grid,
  Tooltip
} from '@mui/material';

const SliderParameter = ({ parameter, value, onChange, error }) => {
  // Extract slider configuration with defaults
  const config = parameter.config || {};
  const min = config.min !== undefined ? config.min : 0;
  const max = config.max !== undefined ? config.max : 100;
  const step = config.step !== undefined ? config.step : 1;
  const defaultValue = config.default !== undefined ? config.default : min;
  
  // Get a safe value - either the current value if it's valid, or the default value
  const safeValue = (() => {
    // Check if value is a valid number
    if (typeof value === 'number' && !isNaN(value)) {
      // Ensure it's within range
      return Math.max(min, Math.min(max, value));
    }
    
    return defaultValue;
  })();

  const handleChange = (event, newValue) => {
    // Safely handle change events
    if (onChange && typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  // Function to create proper marks for the slider
  const createMarks = () => {
    const marks = [
      { value: min, label: min.toString() },
      { value: max, label: max.toString() }
    ];
    
    // Add a zero mark if zero is within the slider range and not already included
    if (min < 0 && max > 0) {
      marks.push({ value: 0, label: '0' });
    }
    
    return marks;
  };
  
  // Custom value label component to improve visibility
  const ValueLabelComponent = (props) => {
    const { children, open, value } = props;
    
    return (
      <Tooltip 
        open={open} 
        enterTouchDelay={0} 
        placement="top" 
        title={value}
        arrow
      >
        {children}
      </Tooltip>
    );
  };
  
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{parameter.name || 'Slider Parameter'}</span>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 'bold', 
          backgroundColor: '#f0f0f0', 
          padding: '2px 6px', 
          borderRadius: '4px',
          border: '1px solid #e0e0e0' 
        }}>{safeValue}</span>
      </Typography>
      
      <Box sx={{ px: 0.5 }}>
        <Slider
          value={safeValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          slots={{
            valueLabel: ValueLabelComponent,
          }}
          aria-labelledby={`${parameter.id}-slider`}
          marks={createMarks()}
          size="small"
          sx={{ 
            mt: 1,
            '& .MuiSlider-thumb': {
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0px 0px 0px 8px rgba(0, 0, 0, 0.16)'
              }
            },
            '& .MuiSlider-rail': {
              opacity: 0.5,
            },
            '& .MuiSlider-mark': {
              backgroundColor: '#bfbfbf',
              height: 8,
              width: 1,
              marginTop: -3
            },
            '& .MuiSlider-markActive': {
              backgroundColor: '#000000'
            }
          }}
        />
        
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography variant="caption" color="text.secondary" sx={{ 
              fontSize: '0.7rem',
              fontWeight: 'medium',
              padding: '1px 4px',
              borderRadius: '3px',
              backgroundColor: min < 0 ? 'rgba(244, 67, 54, 0.1)' : 'transparent'
            }}>
              {min}
            </Typography>
          </Grid>
          {min < 0 && max > 0 && (
            <Grid item>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontSize: '0.7rem',
                fontWeight: 'medium',
                padding: '1px 4px',
                borderRadius: '3px',
                backgroundColor: 'rgba(3, 169, 244, 0.1)'
              }}>
                0
              </Typography>
            </Grid>
          )}
          <Grid item>
            <Typography variant="caption" color="text.secondary" sx={{ 
              fontSize: '0.7rem',
              fontWeight: 'medium',
              padding: '1px 4px',
              borderRadius: '3px',
              backgroundColor: max > 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
            }}>
              {max}
            </Typography>
          </Grid>
        </Grid>
        
        {error && (
          <FormHelperText error sx={{ mt: 0.5, fontSize: '0.7rem' }}>
            {error}
          </FormHelperText>
        )}
      </Box>
      
      {parameter.description && (
        <div style={{ position: 'relative' }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.7rem', 
              display: 'block', 
              mt: 0.5,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {parameter.description}
          </Typography>
          <Tooltip title={parameter.description}>
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                right: 0,
                bottom: 0,
                fontSize: '0.7rem',
                color: 'primary.main',
                cursor: 'pointer',
              }}
            >
              {parameter.description.length > 80 ? 'More info' : ''}
            </Typography>
          </Tooltip>
        </div>
      )}
    </Box>
  );
};

export default SliderParameter;