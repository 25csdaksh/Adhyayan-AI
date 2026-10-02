import apiClient from './apiClient';

/**
 * Health check service
 */
export const healthService = {
  /**
   * Fetch backend system health status
   * @returns {Promise<object>}
   */
  getHealth: async () => {
    return await apiClient.get('/health');
  },
};
