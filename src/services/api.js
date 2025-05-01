// src/services/api.js
import axios from 'axios';
import config from '../config';
import { apiCache } from '../utils/performanceUtils';

// Use environment variable for API URL with fallback to config
const API_BASE_URL = process.env.REACT_APP_API_URL || `${config.API_URL}/api`;

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
export const generateContent = async (parameterValues, categoryIds, contentType = 'combined') => {
  try {
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

    console.log('Generation payload:', JSON.stringify(payload, null, 2));

    // Make the API call
    const response = await api.post('/generate', payload);
    
    // Save to generation history in localStorage
    saveToGenerationHistory({
      content: response.data.content,
      imageData: response.data.imageData,
      metadata: response.data.metadata,
      parameterValues,
      timestamp: new Date().toISOString(),
      id: `gen-${Date.now()}`
    });
    
    return response.data;
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with an error status
      return {
        success: false,
        error: error.response.data?.error || `Server error: ${error.response.status}`
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        error: 'No response from server. Please check your connection.'
      };
    } else {
      // Something else caused the error
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
    
    // Keep only the last 20 generations
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    // Save back to localStorage
    localStorage.setItem('specgen-history', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to generation history:', error);
  }
};

/**
 * Fetch previous generations from history
 * @returns {Promise<Object>} Promise resolving to previous generations
 */
export const fetchPreviousGenerations = async () => {
  try {
    // In a real app, this would be an API call
    // For now, we'll use localStorage
    const historyJSON = localStorage.getItem('specgen-history');
    const history = historyJSON ? JSON.parse(historyJSON) : [];
    
    // Process the data to add titles
    const processedHistory = history.map(item => ({
      ...item,
      title: generateTitle(item.content),
      createdAt: item.timestamp || new Date().toISOString()
    }));
    
    return {
      success: true,
      data: processedHistory
    };
  } catch (error) {
    console.error('Error fetching generation history:', error);
    return {
      success: false,
      error: 'Failed to fetch generation history',
      data: []
    };
  }
};

/**
 * Generate a title from content
 * @param {string} content - Generated content
 * @returns {string} Generated title
 */
const generateTitle = (content) => {
  if (!content) return 'New Generation';
  
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