import apiClient from './apiClient';

export const researchSessionService = {
  createResearchSession: (notebookId, data) =>
    apiClient.post(`/notebooks/${notebookId}/research-sessions`, data),

  getResearchSessions: (notebookId, params = {}) =>
    apiClient.get(`/notebooks/${notebookId}/research-sessions`, { params }),

  getResearchSessionById: (notebookId, id) =>
    apiClient.get(`/notebooks/${notebookId}/research-sessions/${id}`),

  deleteResearchSession: (notebookId, id) =>
    apiClient.delete(`/notebooks/${notebookId}/research-sessions/${id}`),

  exportResearchSession: (notebookId, id, data = {}) =>
    apiClient.post(`/notebooks/${notebookId}/research-sessions/${id}/export`, data),
};
