import React from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  FormHelperText,
  Paper
} from '@mui/material';

const ToggleParameter = ({ parameter, value, onChange, error }) => {
  // Make sure value is a boolean
  const safeValue = typeof value === 'boolean' ? value : false;

  const handleChange = (event) => {
    // Safely handle change events
    if (onChange && typeof onChange === 'function') {
      onChange(event.target.checked);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {parameter.name || 'Toggle Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormControlLabel
            control={
              <Switch
                checked={safeValue}
                onChange={handleChange}
                name={parameter.id}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                {parameter.label || (safeValue ? 'Enabled' : 'Disabled')}
              </Typography>
            }
          />
          
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

export default ToggleParameter; 