import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

// Get API base URL from Vite environment variables or fallback to relative '/api' for proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90s timeout for complex AI study tools, deep summaries, and embedding generation
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach bearer token through centralized tokenStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error formatting and handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // If 401 on authenticated endpoints (not login/register), clear token
    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      tokenStorage.removeToken();
    }

    const normalizedError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      statusCode: status || 500,
      errors: error.response?.data?.errors || [],
      isNetworkError: !error.response,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
