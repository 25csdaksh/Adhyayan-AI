/**
 * Centralized Token Storage Utility
 * Prepares the architecture so httpOnly cookie authentication or alternative
 * storage mechanisms can be adopted later without rewriting application consumers.
 */

const TOKEN_KEY = 'studylm_auth_token';

export const tokenStorage = {
  /**
   * Retrieve the stored authentication token
   * @returns {string|null}
   */
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to read auth token from storage:', e);
      return null;
    }
  },

  /**
   * Persist the authentication token
   * @param {string} token
   */
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to write auth token to storage:', e);
    }
  },

  /**
   * Remove the authentication token
   */
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove auth token from storage:', e);
    }
  },

  /**
   * Check if a token currently exists in storage
   * @returns {boolean}
   */
  hasToken: () => {
    return Boolean(tokenStorage.getToken());
  },
};
