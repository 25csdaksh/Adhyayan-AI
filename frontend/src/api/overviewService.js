import apiClient from './apiClient';

export const insightService = {
  getSavedInsights: (notebookId, params = {}) =>
    apiClient.get(`/notebooks/${notebookId}/insights`, { params }),
  createSavedInsight: (notebookId, data) =>
    apiClient.post(`/notebooks/${notebookId}/insights`, data),
  updateSavedInsight: (notebookId, id, data) =>
    apiClient.patch(`/notebooks/${notebookId}/insights/${id}`, data),
  deleteSavedInsight: (notebookId, id) =>
    apiClient.delete(`/notebooks/${notebookId}/insights/${id}`),

  // Bookmarks
  getBookmarks: (notebookId, params = {}) =>
    apiClient.get(`/notebooks/${notebookId}/bookmarks`, { params }),
  addBookmark: (notebookId, data) =>
    apiClient.post(`/notebooks/${notebookId}/bookmarks`, data),
  removeBookmark: (notebookId, id) =>
    apiClient.delete(`/notebooks/${notebookId}/bookmarks/${id}`),
};

export const overviewService = {
  getOverview: (notebookId) => apiClient.get(`/notebooks/${notebookId}/overview`),
  getRecommendations: (notebookId) => apiClient.get(`/notebooks/${notebookId}/recommendations`),
  getActivity: (notebookId, params = {}) => apiClient.get(`/notebooks/${notebookId}/activity`, { params }),
  getRelationships: (notebookId) => apiClient.get(`/notebooks/${notebookId}/relationships`),
  detectRelationships: (notebookId) => apiClient.post(`/notebooks/${notebookId}/relationships/detect`),
  universalSearch: (notebookId, params = {}) => apiClient.get(`/notebooks/${notebookId}/universal-search`, { params }),
  getChunkPreview: (notebookId, chunkId) => apiClient.get(`/notebooks/${notebookId}/chunks/${chunkId}/preview`),
};
