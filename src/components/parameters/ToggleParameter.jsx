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
  const safeValue = typeof value === 'boolean' ? value : 
    (parameter.defaultValue !== undefined ? parameter.defaultValue : false);

  const handleChange = (event) => {
    // Safely handle change events
    if (onChange && typeof onChange === 'function') {
      onChange(event.target.checked);
    }
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
        {parameter.name || 'Toggle Parameter'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 0.5 }}>
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormControlLabel
            control={
              <Switch
                checked={safeValue}
                onChange={handleChange}
                name={parameter.id}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {parameter.label || (safeValue ? 'Enabled' : 'Disabled')}
              </Typography>
            }
            sx={{ mb: 0.5 }}
          />
          
          {error && (
            <FormHelperText error sx={{ mt: 0.5, fontSize: '0.7rem' }}>
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

export default ToggleParameter;