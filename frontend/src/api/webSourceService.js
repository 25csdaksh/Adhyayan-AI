import apiClient from './apiClient';

/**
 * Add / Ingest a new web source URL into a notebook
 * @param {string} notebookId
 * @param {string|Object} urlOrData
 */
export const createWebSource = async (notebookId, urlOrData) => {
  const payload = typeof urlOrData === 'string' ? { url: urlOrData } : urlOrData;
  const response = await apiClient.post(`/notebooks/${notebookId}/web-sources`, payload);
  return response.data;
};

export const addWebSource = createWebSource;

/**
 * Get all web sources for a notebook
 * @param {string} notebookId
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getWebSources = async (notebookId, { page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get(`/notebooks/${notebookId}/web-sources`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get a single web source by ID
 * @param {string} notebookId
 * @param {string} webSourceId
 */
export const getWebSourceById = async (notebookId, webSourceId) => {
  const response = await apiClient.get(`/notebooks/${notebookId}/web-sources/${webSourceId}`);
  return response.data;
};

/**
 * Force refresh an existing web source
 * @param {string} notebookId
 * @param {string} webSourceId
 */
export const refreshWebSource = async (notebookId, webSourceId) => {
  const response = await apiClient.post(
    `/notebooks/${notebookId}/web-sources/${webSourceId}/refresh`
  );
  return response.data;
};

/**
 * Delete a web source from a notebook
 * @param {string} notebookId
 * @param {string} webSourceId
 */
export const deleteWebSource = async (notebookId, webSourceId) => {
  const response = await apiClient.delete(
    `/notebooks/${notebookId}/web-sources/${webSourceId}`
  );
  return response.data;
};

export const webSourceService = {
  createWebSource,
  addWebSource,
  getWebSources,
  getWebSourceById,
  refreshWebSource,
  deleteWebSource,
};

export default webSourceService;
