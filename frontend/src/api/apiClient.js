import axios from 'axios';

// Get API base URL from Vite environment variables or fallback to relative '/api' for proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach authentication token or headers (prepared for future phases)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studylm_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error formatting
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const normalizedError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || [],
      isNetworkError: !error.response,
    };
    return Promise.reject(normalizedError);
  }
);

export default apiClient;
