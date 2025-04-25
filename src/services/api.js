import axios from 'axios';
import config from '../config';
import { apiCache, debounce } from '../utils/performanceUtils';

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
 * Generates content (fiction, image, or combined) based on provided parameters
 * Strictly follows API specification format
 * 
 * @param {Object} parameterValues - Object with category IDs as keys and parameter selections as values
 * @param {Array} categoryIds - Array of category IDs used to identify categories
 * @param {string} contentType - Type of content to generate: 'fiction', 'image', or 'combined'
 * @returns {Promise<Object>} Promise resolving to generation result
 */
export const generateContent = async (parameterValues, categoryIds, contentType = 'fiction') => {
  try {
    // Update global state without overwriting existing properties
    window.appState = {
      ...(window.appState || {}),
      parameters: parameterValues,
      categories: categoryIds,
      contentType: contentType
    };

    const payload = {
      contentType: contentType
    };
    
    // Create a fresh empty object for parameterValues to avoid any hidden properties
    const cleanParams = {};
    
    // Copy only primitive values to ensure clean serialization
    Object.entries(parameterValues).forEach(([categoryId, params]) => {
      if (typeof params === 'object' && params !== null) {
        cleanParams[categoryId] = {};
        
        Object.entries(params).forEach(([paramId, value]) => {
          // Skip empty values
          if (value === null || value === undefined || 
              (typeof value === 'string' && value === '') ||
              (Array.isArray(value) && value.length === 0)) {
            return;
          }
          
          // Handle values based on their type to ensure proper serialization
          if (typeof value === 'boolean') {
            cleanParams[categoryId][paramId] = Boolean(value);
          } else if (typeof value === 'number') {
            cleanParams[categoryId][paramId] = Number(value);
          } else if (typeof value === 'string') {
            cleanParams[categoryId][paramId] = String(value);
          } else if (Array.isArray(value)) {
            cleanParams[categoryId][paramId] = [...value]; // Create a clean copy
          } else {
            cleanParams[categoryId][paramId] = value;
          }
        });
      }
    });
    
    // Assign the clean params to the payload
    payload.parameterValues = cleanParams;

    // Log the final payload
    console.log('Final API payload:', JSON.stringify(payload, null, 2));
    
    // Additional debug to see if stringifying + parsing helps eliminate any hidden properties
    const cleanedPayload = JSON.parse(JSON.stringify(payload));
    
    // Make the API call
    const response = await api.post('/generate', cleanedPayload);
    return response.data;
  } catch (error) {
    console.error(`Error generating ${contentType}:`, error);
    
    // Create a helpful error object
    const enhancedError = {
      message: 'Failed to generate content',
      originalError: error.message || 'Unknown error',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    };
    
    throw enhancedError;
  }
};

// Alias for generateContent for backward compatibility
export const generateFiction = generateContent;

export default api;