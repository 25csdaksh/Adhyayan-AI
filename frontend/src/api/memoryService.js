import apiClient from './apiClient';

export const memoryService = {
  // User Research Memories
  getUserMemories: (params = {}) => apiClient.get('/memory', { params }),
  createUserMemory: (data) => apiClient.post('/memory', data),
  updateUserMemory: (id, data) => apiClient.patch(`/memory/${id}`, data),
  deleteUserMemory: (id) => apiClient.delete(`/memory/${id}`),

  // Notebook Specific Memory
  getNotebookMemory: (notebookId) => apiClient.get(`/notebooks/${notebookId}/memory`),
  updateNotebookMemory: (notebookId, data) => apiClient.patch(`/notebooks/${notebookId}/memory`, data),
};
