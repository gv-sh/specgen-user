import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  FormHelperText,
  Paper,
  Grid
} from '@mui/material';

const RadioParameter = ({ parameter, value, onChange, error }) => {
  // Ensure we have valid options
  const options = Array.isArray(parameter.values) ? parameter.values : [];
  
  // Get a safe value - either the current value if it's in options, or the default value, or the first option id
  const safeValue = (() => {
    if (value !== undefined && value !== null) {
      return value;
    }
    
    if (parameter.defaultValue !== undefined) {
      return parameter.defaultValue;
    }
    
    return options.length > 0 ? options[0].id : '';
  })();

  const handleChange = (event) => {
    // Safely handle change events
    if (onChange && typeof onChange === 'function') {
      onChange(event.target.value);
    }
  };
  
  // Handle empty options case
  if (options.length === 0) {
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
          {parameter.name || 'Radio Parameter'}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 0.5 }}>
          <Typography variant="body2" color="error">
            No options available
          </Typography>
        </Paper>
        {parameter.description && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            {parameter.description}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
        {parameter.name || 'Radio Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 0.5 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.8rem' }}>
            {parameter.label || 'Select an option'}
          </FormLabel>
          
          <RadioGroup
            name={parameter.id}
            value={safeValue}
            onChange={handleChange}
          >
            <Grid container spacing={1}>
              {options.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option.id || option.label}>
                  <FormControlLabel
                    value={option.id}
                    control={<Radio color="primary" size="small" />}
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {option.label}
                      </Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
          
          {error && (
            <FormHelperText error sx={{ mt: 1, fontSize: '0.7rem' }}>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </Paper>
      
      {parameter.description && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
          {parameter.description}
        </Typography>
      )}
    </Box>
  );
};

export default RadioParameter;