import React from 'react';
import {
  Box,
  Slider,
  Typography,
  FormHelperText,
  Paper,
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
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {parameter.name || 'Slider Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <Box sx={{ px: 2 }}>
          <Typography variant="body2" gutterBottom>
            {parameter.label || 'Select a value'}
          </Typography>
          
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
            sx={{ mt: 1 }}
          />
          
          <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
            <Grid item>
              <Typography variant="caption" color="text.secondary">
                Min: {min}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="caption" color="text.secondary">
                Max: {max}
              </Typography>
            </Grid>
          </Grid>
          
          {error && (
            <FormHelperText error sx={{ mt: 1 }}>
              {error}
            </FormHelperText>
          )}
        </Box>
      </Paper>
      
      {parameter.description && (
        <Typography variant="caption" color="text.secondary">
          {parameter.description}
        </Typography>
      )}
    </Box>
  );
};

export default SliderParameter; 