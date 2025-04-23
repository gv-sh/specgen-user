import axios from 'axios';
import config from '../config';

// Use environment variable for API URL with fallback to config
const API_BASE_URL = process.env.REACT_APP_API_URL || `${config.API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchParameters = async (categoryId) => {
  try {
    const response = await api.get(`/parameters?categoryId=${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching parameters for category ${categoryId}:`, error);
    throw error;
  }
};

export const generateContent = async (parameters) => {
  try {
    const response = await api.post('/generate', parameters);
    return response.data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const generateFiction = async (parameterValues, categoryIds, generationType = 'fiction') => {
  try {
    const payload = {
      parameterValues,
      categoryIds,
      generationType
    };
    
    console.log(`Sending ${generationType} generation request:`, payload);
    
    const response = await api.post('/generate', payload);
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid server response: Missing data');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error generating ${generationType}:`, error);
    
    // Create a more helpful error object
    const enhancedError = {
      message: 'Failed to generate content',
      originalError: error.message || 'Unknown error',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    };
    
    // Rethrow with enhanced info
    throw enhancedError;
  }
};

export default api; 