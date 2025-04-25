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
  Paper,
  Chip
} from '@mui/material';

const CheckboxParameter = ({ parameter, value, onChange, error }) => {
  // Ensure we have valid options
  const options = Array.isArray(parameter.values) ? parameter.values : [];
  
  // Make sure value is an array
  const safeValue = Array.isArray(value) ? value : [];

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
  
  // safeValue already contains labels, so we can use it directly

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {parameter.name || 'Checkbox Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            {parameter.label || 'Select options'}
          </FormLabel>
          
          <FormGroup>
            {options.length > 0 ? (
              options.map((option) => (
                <FormControlLabel
                  key={option.id || option.label}
                  control={
                    <Checkbox
                      checked={safeValue.includes(option.id)}
                      onChange={() => handleChange(option.id)}
                      name={option.id || option.label}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {option.label}
                    </Typography>
                  }
                />
              ))
            ) : (
              <Typography variant="body2" color="error">
                No options available
              </Typography>
            )}
          </FormGroup>
          
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

export default CheckboxParameter; 