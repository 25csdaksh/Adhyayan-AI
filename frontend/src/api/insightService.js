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
  createBookmark: (notebookId, data) =>
    apiClient.post(`/notebooks/${notebookId}/bookmarks`, data),
  addBookmark: (notebookId, data) =>
    apiClient.post(`/notebooks/${notebookId}/bookmarks`, data),
  removeBookmark: (notebookId, id) =>
    apiClient.delete(`/notebooks/${notebookId}/bookmarks/${id}`),
};
