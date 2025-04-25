import React from 'react';
import {
  Box,
  Slider,
  Typography,
  FormHelperText,
  Grid
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

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
        {parameter.name || 'Slider Parameter'}
      </Typography>
      
      <Box sx={{ px: 0.5 }}>
        <Slider
          value={safeValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          aria-labelledby={`${parameter.id}-slider`}
          marks={[
            { value: min, label: min.toString() },
            { value: max, label: max.toString() }
          ]}
          size="small"
          sx={{ mt: 1 }}
        />
        
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Min: {min}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Max: {max}
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
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
          {parameter.description}
        </Typography>
      )}
    </Box>
  );
};

export default SliderParameter;