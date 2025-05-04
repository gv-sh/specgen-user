// src/pages/LibraryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryLibrary from '../components/stories/StoryLibrary';
import GenerationControls from '../components/generation/GenerationControls';
import { fetchPreviousGenerations } from '../services/api';

const LibraryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stories, setStories] = useState([]);
  const [highlightedStoryId, setHighlightedStoryId] = useState(null);

  // Fetch stories on mount
  useEffect(() => {
    loadStories();
  }, []);

  // Load stories from API or local storage
  const loadStories = async () => {
    if (loading && stories.length > 0) return;

    setLoading(true);
    setError(null);

    try {
      // Check localStorage for cached data
      const cachedStoriesJSON = localStorage.getItem('specgen-cached-stories');
      const cachedTimestamp = localStorage.getItem('specgen-cached-timestamp');
      const now = Date.now();
      const cacheAge = cachedTimestamp ? now - parseInt(cachedTimestamp, 10) : Infinity;
      const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes cache validity

      if (cachedStoriesJSON && cacheValid) {
        console.log('Using cached stories data');
        const cachedStories = JSON.parse(cachedStoriesJSON);
        if (cachedStories && cachedStories.length > 0) {
          setStories(cachedStories);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // Fetch from API if cache invalid or empty
      const response = await fetchPreviousGenerations();
      if (response.success && response.data) {
        console.log(`Loaded ${response.data.length} stories from API`);
        setStories(response.data);
        setError(null);

        // Update cache
        localStorage.setItem('specgen-cached-stories', JSON.stringify(response.data));
        localStorage.setItem('specgen-cached-timestamp', now.toString());
      } else {
        throw new Error(response.error || 'Failed to load stories');
      }
    } catch (err) {
      console.error('Error fetching stories:', err);

      // Try localStorage fallback even if cache expired
      const cachedStoriesJSON = localStorage.getItem('specgen-cached-stories');
      if (cachedStoriesJSON) {
        const cachedStories = JSON.parse(cachedStoriesJSON);
        if (cachedStories && cachedStories.length > 0) {
          console.log('Falling back to cached stories data');
          setStories(cachedStories);
          setError(null);
          setLoading(false);
          return;
        }
      }

      setError('Failed to load your story library');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to story page
  const handleStorySelect = (story) => {
    if (story && story.id) {
      navigate(`/story?id=${story.id}`);
    }
  };

  // Handle navigation to creation page
  const handleCreateNew = () => {
    navigate('/parameters');
  };

  return (
    <div className="bg-card rounded-md border shadow-sm h-full overflow-auto">
      <GenerationControls
        onBackToLibrary={() => {}}
        storyTitle="Story Library"
      />
      <StoryLibrary
        stories={stories}
        onStorySelect={handleStorySelect}
        onCreateNew={handleCreateNew}
        highlightedStoryId={highlightedStoryId}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default LibraryPage;