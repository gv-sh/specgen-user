import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography
} from '@mui/material';

const DropdownParameter = ({ parameter, value, onChange, error }) => {
  // Ensure we have valid options
  const options = Array.isArray(parameter.values) ? parameter.values : [];
  
  // Get a safe value - either the current value if it's valid, or the default value, or the first option's id
  const safeValue = (() => {
    if (value !== undefined && value !== null) {
      // If we have a value, use it
      return value;
    }
    
    if (parameter.defaultValue !== undefined) {
      return parameter.defaultValue;
    }
    
    // Use the first option's id as the default
    return options.length > 0 ? options[0].id : '';
  })();

  const handleChange = (event) => {
    // Safely handle change events
    if (onChange && typeof onChange === 'function') {
      // Pass the ID value to match the database ID format
      onChange(event.target.value);
    }
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
        {parameter.name || 'Dropdown Parameter'}
      </Typography>
      
      <FormControl 
        fullWidth 
        error={!!error} 
        size="small" 
        variant="outlined" 
        sx={{ mt: 0.5, mb: 0.5 }}
      >
        <InputLabel id={`${parameter.id}-label`} sx={{ fontSize: '0.8rem' }}>
          {parameter.label || 'Select an option'}
        </InputLabel>
        
        <Select
          labelId={`${parameter.id}-label`}
          id={parameter.id}
          value={safeValue}
          label={parameter.label || 'Select an option'}
          onChange={handleChange}
          sx={{ fontSize: '0.8rem' }}
        >
          {options.length > 0 ? (
            options.map((option) => (
              <MenuItem key={option.id || option.label} value={option.id}>
                <Typography sx={{ fontSize: '0.8rem' }}>{option.label}</Typography>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled value="">
              <Typography sx={{ fontSize: '0.8rem' }} color="text.secondary">
                No options available
              </Typography>
            </MenuItem>
          )}
        </Select>
        
        {error && (
          <FormHelperText error sx={{ fontSize: '0.7rem' }}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
      
      {parameter.description && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
          {parameter.description}
        </Typography>
      )}
    </Box>
  );
};

export default DropdownParameter;