import axios, { AxiosError } from 'axios';

/**
 * Axios API client instance
 * Configured with base URL and timeout settings
 * Used for all HTTP requests to the backend API
 */
const api = axios.create({
  baseURL: 'https://advisory-slug-frivoller-95937079.koyeb.app/api/v1',
  timeout: 10000,
});

/**
 * Response interceptor
 * Handles API response errors globally
 * Previously contained toast notifications (removed)
 */
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Error handling without toast notifications
    return Promise.reject(error);
  }
);

export default api; 