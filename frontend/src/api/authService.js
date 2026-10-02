import apiClient from './apiClient';

/**
 * Authentication & User Profile API Service
 */
export const authService = {
  /**
   * Register a new user account
   * @param {object} payload - { name, email, password }
   * @returns {Promise<object>}
   */
  register: async (payload) => {
    return await apiClient.post('/auth/register', payload);
  },

  /**
   * Log in an existing user
   * @param {object} payload - { email, password }
   * @returns {Promise<object>}
   */
  login: async (payload) => {
    return await apiClient.post('/auth/login', payload);
  },

  /**
   * Fetch authenticated user profile
   * @returns {Promise<object>}
   */
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  /**
   * Update user profile details
   * @param {object} payload - { name, avatar }
   * @returns {Promise<object>}
   */
  updateProfile: async (payload) => {
    return await apiClient.patch('/auth/profile', payload);
  },

  /**
   * Log out user
   * @returns {Promise<object>}
   */
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },
};
