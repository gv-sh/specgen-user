import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper, Grid } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/categories');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 10 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Welcome to SpecGen
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Create unique speculative fiction stories with AI
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={handleStart} sx={{ py: 1.5, px: 4 }}>
            Start Creating
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Choose Your Genres
            </Typography>
            <Typography variant="body1">
              Select from science fiction, fantasy, horror, and more to define your story's setting.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Customize Parameters
            </Typography>
            <Typography variant="body1">
              Tailor your story with specific themes, character types, settings, and plot elements.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Generate Stories
            </Typography>
            <Typography variant="body1">
              Create unique, AI-generated stories based on your preferences and creative direction.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          How It Works
        </Typography>
        <Paper elevation={1} sx={{ p: 4, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                1. Select Genres
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose one or more genres to define your story world
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                2. Customize Parameters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust specific parameters to tailor your story
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                3. Generate Content
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your unique story with AI assistance
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Button variant="contained" size="large" onClick={handleStart} sx={{ py: 1.5, px: 4 }}>
          Begin Your Story
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 