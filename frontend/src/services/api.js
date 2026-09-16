import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers['X-Client-Timestamp'] = new Date().toISOString();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message for safe presentation
    const customError = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || error.message || 'A network error occurred. Please check your connection.',
      details: error.response?.data?.error?.details || null,
    };

    return Promise.reject(customError);
  }
);

export default api;
