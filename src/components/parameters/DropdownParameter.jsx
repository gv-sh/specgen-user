import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Paper
} from '@mui/material';

const DropdownParameter = ({ parameter, value, onChange, error }) => {
  // Ensure we have valid options
  const options = Array.isArray(parameter.values) ? parameter.values : [];
  
  // Get a safe value - either the current value if it's valid, the default value, or the first option's id
  const safeValue = (() => {
    if (value !== undefined && value !== null && options.some(opt => opt.id === value)) {
      return value;
    }
    
    if (parameter.defaultValue && options.some(opt => opt.id === parameter.defaultValue)) {
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
  
  // Get the selected option's label for display
  const selectedLabel = options.find(opt => opt.id === safeValue)?.label || '';

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {parameter.name || 'Dropdown Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <FormControl fullWidth error={!!error}>
          <InputLabel id={`${parameter.id}-label`}>
            {parameter.label || 'Select an option'}
          </InputLabel>
          
          <Select
            labelId={`${parameter.id}-label`}
            id={parameter.id}
            value={safeValue}
            label={parameter.label || 'Select an option'}
            onChange={handleChange}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Typography variant="body2">{option.label}</Typography>
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                <Typography variant="body2" color="text.secondary">
                  No options available
                </Typography>
              </MenuItem>
            )}
          </Select>
          
          {error && (
            <FormHelperText error sx={{ mt: 1 }}>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </Paper>
      
      {parameter.description && (
        <Typography variant="caption" color="text.secondary">
          {parameter.description}
        </Typography>
      )}
    </Box>
  );
};

export default DropdownParameter; 