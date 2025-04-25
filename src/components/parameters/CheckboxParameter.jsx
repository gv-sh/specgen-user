import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  FormHelperText,
  Paper
} from '@mui/material';

const CheckboxParameter = ({ parameter, value, onChange, error }) => {
  // Ensure we have valid options
  const options = Array.isArray(parameter.values) ? parameter.values : [];
  
  // Make sure value is an array
  const safeValue = Array.isArray(value) ? value : 
    (parameter.defaultValue ? parameter.defaultValue : []);

  // Handle checkbox change
  const handleChange = (optionId) => {
    if (!onChange || typeof onChange !== 'function') return;
    
    // Create a new array with or without the selected option's ID
    if (safeValue.includes(optionId)) {
      // Remove the option ID
      onChange(safeValue.filter(id => id !== optionId));
    } else {
      // Add the option ID
      onChange([...safeValue, optionId]);
    }
  };
  
  // Handle empty options case
  if (options.length === 0) {
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
          {parameter.name || 'Checkbox Parameter'}
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
        {parameter.name || 'Checkbox Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 0.5 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.8rem' }}>
            {parameter.label || 'Select options'}
          </FormLabel>
          
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option.id || option.label}
                control={
                  <Checkbox
                    checked={safeValue.includes(option.id)}
                    onChange={() => handleChange(option.id)}
                    name={option.id || option.label}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {option.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
          
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

export default CheckboxParameter;