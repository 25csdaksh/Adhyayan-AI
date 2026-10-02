import apiClient from './apiClient';

/**
 * Notebook API Service
 */
export const notebookService = {
  /**
   * Create a new notebook
   * @param {object} data - { title, description, icon }
   * @returns {Promise<object>}
   */
  createNotebook: async (data) => {
    return await apiClient.post('/notebooks', data);
  },

  /**
   * Get all notebooks for the authenticated user with optional search and pagination
   * @param {object} [params] - { page, limit, search }
   * @returns {Promise<object>}
   */
  getNotebooks: async (params = {}) => {
    return await apiClient.get('/notebooks', { params });
  },

  /**
   * Get a single notebook by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  getNotebook: async (id) => {
    return await apiClient.get(`/notebooks/${id}`);
  },

  /**
   * Update notebook details
   * @param {string} id
   * @param {object} data - { title, description, icon }
   * @returns {Promise<object>}
   */
  updateNotebook: async (id, data) => {
    return await apiClient.patch(`/notebooks/${id}`, data);
  },

  /**
   * Delete a notebook by ID
   * @param {string} id
   * @returns {Promise<object>}
   */
  deleteNotebook: async (id) => {
    return await apiClient.delete(`/notebooks/${id}`);
  },
};
