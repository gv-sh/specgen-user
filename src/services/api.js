// src/services/api.js
import axios from 'axios';
import config from '../config';
import { apiCache } from '../utils/performanceUtils';

// Use environment variable for API URL with fallback to config
const API_BASE_URL = `${config.API_URL}/api`;

// Log the actual API URL being used for debugging
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all categories from the API
 * @returns {Promise<Object>} Promise resolving to response data
 */
export const fetchCategories = async () => {
  try {
    // Check if we have a cached version first
    const cacheKey = 'categories';
    const cachedData = apiCache.get(cacheKey);

    if (cachedData) {
      console.log('Using cached categories data');
      return cachedData;
    }

    // If not in cache, make the API call
    const response = await api.get('/categories');

    // Cache the response (valid for 5 minutes)
    apiCache.set(cacheKey, response.data, 5 * 60 * 1000);

    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetches parameters for a specific category
 * @param {string} categoryId - ID of the category to fetch parameters for
 * @returns {Promise<Object>} Promise resolving to response data
 */
export const fetchParameters = async (categoryId) => {
  try {
    // Check if we have a cached version first
    const cacheKey = `parameters_${categoryId}`;
    const cachedData = apiCache.get(cacheKey);

    if (cachedData) {
      console.log(`Using cached parameters data for category ${categoryId}`);
      return cachedData;
    }

    // If not in cache, make the API call
    const response = await api.get(`/parameters?categoryId=${categoryId}`);

    // Cache the response (valid for 5 minutes)
    apiCache.set(cacheKey, response.data, 5 * 60 * 1000);

    return response.data;
  } catch (error) {
    console.error(`Error fetching parameters for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Generate content based on selected parameters
 * @param {Object} parameterValues - Object with category IDs and their parameter values
 * @param {Array} categoryIds - Array of selected category IDs
 * @param {string} contentType - Type of content to generate ('fiction', 'image', or 'combined')
 * @returns {Promise<Object>} Generated content response
 */
export const generateContent = async (parameterValues, categoryIds, contentType = 'combined', year = null, title = null) => {
  try {
    // Create a unique ID for the generation request
    const requestId = `request-${Date.now()}`;

    // Validate inputs
    if (!parameterValues || Object.keys(parameterValues).length === 0) {
      return {
        success: false,
        error: 'No parameters provided for generation'
      };
    }

    const payload = {
      parameterValues,
      contentType
    };

    // Add year to payload if provided
    if (year) {
      payload.year = parseInt(year, 10);
    }

    // Add title to payload if provided
    if (title) {
      payload.title = title;
    }

    console.log('Generation payload:', JSON.stringify(payload, null, 2));

    // Make the API call
    const response = await api.post('/generate', payload);
    
    // Create story object
    const newStory = {
      id: requestId,
      title: response.data.title || title || "Untitled Story",
      createdAt: new Date().toISOString(),
      content: response.data.content,
      imageData: response.data.imageData ? `data:image/png;base64,${response.data.imageData}` : null,
      parameterValues,
      metadata: response.data.metadata,
      year: response.data.year || year || null
    };

    // Save to local storage if needed
    saveToGenerationHistory(newStory);
        
    return {
      ...response.data,
      success: true,
      generatedStory: newStory
    };
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Handle errors appropriately
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || `Server error: ${error.response.status}`
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from server. Please check your connection.'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to generate content. Please try again.'
      };
    }
  }
};

/**
 * Save generation to local storage history
 * @param {Object} generation - Generation data to save
 */
const saveToGenerationHistory = (generation) => {
  try {
    // Get existing history
    const historyJSON = localStorage.getItem('specgen-history');
    let history = historyJSON ? JSON.parse(historyJSON) : [];

    // Add new generation at the beginning
    history = [generation, ...history];

    // Limit to 10 stories instead of 100
    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    // Remove imageData to save space
    history = history.map(story => ({
      ...story,
      // Only store a reference to image, not the full base64 data
      imageData: story.imageData ? 'stored-externally' : null
    }));

    // Try to save, but catch quota errors
    try {
      localStorage.setItem('specgen-history', JSON.stringify(history));
      console.log('Saved story to history:', generation.id);
    } catch (storageError) {
      if (storageError.name === 'QuotaExceededError') {
        // Clear older items and try again with fewer items
        localStorage.removeItem('specgen-cached-stories');
        history = history.slice(0, 5);
        localStorage.setItem('specgen-history', JSON.stringify(history));
        console.warn('Storage quota nearly exceeded, reduced history size');
      }
    }
  } catch (error) {
    console.error('Error saving to generation history:', error);
  }
};

/**
 * Fetch previous generations from history
 * @param {Object} filters - Optional filters for stories
 * @returns {Promise<Object>} Promise resolving to previous generations
 */
export const fetchPreviousGenerations = async (filters = {}) => {
  try {
    // Make API call to fetch stories
    const response = await api.get('/content');

    // If API call succeeded
    if (response.data && response.data.success) {
      let stories = response.data.data || [];

      // Filter to only include stories with content
      stories = stories.filter(story => story.content);

      // Apply additional filters if provided
      if (filters.year) {
        stories = stories.filter(item =>
          item.year === parseInt(filters.year, 10) ||
          item.year?.toString() === filters.year
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        stories = stories.filter(item =>
          (item.title && item.title.toLowerCase().includes(searchTerm)) ||
          (item.content && item.content.toLowerCase().includes(searchTerm))
        );
      }

      // Sort by created date (newest first by default)
      if (filters.sort === 'oldest') {
        stories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return {
        success: true,
        data: stories
      };
    }

    // Fallback to local storage if API fails or returns no data
    return fallbackToLocalStorage(filters);
  } catch (error) {
    console.error('Error fetching stories from API:', error);
    // Fallback to localStorage if API fails
    return fallbackToLocalStorage(filters);
  }
};

// Fallback function for backward compatibility
const fallbackToLocalStorage = (filters = {}) => {
  try {
    const historyJSON = localStorage.getItem('specgen-history');
    const history = historyJSON ? JSON.parse(historyJSON) : [];

    // Process the data to ensure all fields are present
    const processedHistory = history.map(item => ({
      id: item.id || `gen-${Date.now() + Math.random()}`,
      title: item.title || generateTitle(item.content),
      content: item.content || '',
      imageData: normalizeImageData(item.imageData),
      createdAt: item.timestamp || item.createdAt || new Date().toISOString(),
      year: item.year || null,
      parameterValues: item.parameterValues || {},
      metadata: item.metadata || {}
    }));

    console.log('Fallback: Using localStorage for stories');

    // Apply filters
    let filteredHistory = [...processedHistory];

    // Apply the same filters as in the main function
    if (filters.year) {
      filteredHistory = filteredHistory.filter(item =>
        item.year === parseInt(filters.year, 10)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredHistory = filteredHistory.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.content && item.content.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.sort === 'oldest') {
      filteredHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filteredHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return {
      success: true,
      data: filteredHistory
    };
  } catch (error) {
    console.error('Error in localStorage fallback:', error);
    return {
      success: false,
      error: 'Failed to fetch stories',
      data: []
    };
  }
};

/**
 * Normalize image data to ensure consistent format
 * @param {string} imageData - Raw or formatted image data
 * @returns {string} Properly formatted image data
 */
const normalizeImageData = (imageData) => {
  if (!imageData) return null;

  if (typeof imageData === 'string') {
    if (imageData.startsWith('data:image')) {
      return imageData;
    } else {
      return `data:image/png;base64,${imageData}`;
    }
  }

  return null;
};

/**
 * Generate a title from content
 * @param {string} content - Generated content
 * @returns {string} Generated title
 */
const generateTitle = (content) => {
  if (!content) return 'Untitled Story';

  // Look for **Title:** in the content
  if (content.includes('**Title:')) {
    const titleMatch = content.match(/\*\*Title:(.*?)\*\*/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
  }

  // Take first sentence or first 40 characters
  const firstSentence = content.split(/[.!?]|\n/)[0].trim();
  if (firstSentence.length <= 40) {
    return firstSentence;
  }

  return firstSentence.substring(0, 37) + '...';
};

// Alias for backward compatibility
export const generateFiction = generateContent;

export default api;