/**
 * API Client Configuration
 * Centralizes axios configuration and common API functionality
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 120000, // 120 seconds for PDF processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens or logging
apiClient.interceptors.request.use(
  (config) => {
    // Add any request modifications here (e.g., auth tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ detail: string }>) => {
    // Enhanced error handling for FastAPI responses
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const detail = error.response.data?.detail;

      switch (status) {
        case 400:
          errorMessage = detail || 'Bad Request - Invalid data provided';
          break;
        case 404:
          errorMessage = detail || 'Resource not found';
          break;
        case 422:
          errorMessage = detail || 'Validation Error - Check your input data';
          break;
        case 500:
          errorMessage = detail || 'Internal Server Error';
          break;
        default:
          errorMessage = detail || `Error ${status}: ${error.response.statusText}`;
      }

      console.error('API Error:', {
        status,
        detail,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'Network Error - Unable to reach the server';
      console.error('Network Error:', error.message);
    } else {
      // Error in request configuration
      errorMessage = error.message;
      console.error('Request Error:', error.message);
    }

    // Attach user-friendly message to error
    error.message = errorMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
