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
      // We're already using labels as values, so just pass the value along
      onChange(event.target.value);
    }
  };
 
  // The safeValue is already the label, so no need to lookup

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {parameter.name || 'Radio Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            {parameter.label || 'Select an option'}
          </FormLabel>
          
          <RadioGroup
            name={parameter.id}
            value={safeValue}
            onChange={handleChange}
          >
            <Grid container spacing={2}>
              {options.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option.id || option.label}>
                  <FormControlLabel
                    value={option.id}
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body2">
                        {option.label}
                      </Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
          
          {options.length === 0 && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              No options available
            </Typography>
          )}
          
          {error && (
            <FormHelperText error sx={{ mt: 1 }}>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </Paper>
    </Box>
  );
};

export default RadioParameter;