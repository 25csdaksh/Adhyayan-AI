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

// Response Interceptor: Standardize error formatting, handle 401 unauthorized & transient retries
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const requestUrl = config?.url || '';

    // If 401 on authenticated endpoints (not login/register), clear token
    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      tokenStorage.removeToken();
    }

    // Safe Transient Retries for idempotent GET requests on network failures or 502/503/504
    const isIdempotent = config && (!config.method || config.method.toLowerCase() === 'get');
    const isTransientError = !error.response || [502, 503, 504].includes(status);

    if (config && isIdempotent && isTransientError) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        const delayMs = config.__retryCount * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return apiClient(config);
      }
    }

    const errorBody = error.response?.data?.error;
    const normalizedError = {
      message:
        errorBody?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      statusCode: status || (error.code === 'ECONNABORTED' ? 504 : 500),
      code: errorBody?.code || (status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'UNKNOWN_ERROR'),
      errors: error.response?.data?.errors || [],
      isNetworkError: !error.response,
      requestId: errorBody?.requestId,
      retryAfterSeconds: errorBody?.retryAfterSeconds,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;

