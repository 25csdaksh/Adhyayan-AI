import apiClient from './apiClient';

export const chatService = {
  /**
   * Create a new chat session for a notebook
   * @param {string} notebookId
   * @param {{ title?: string }} [data]
   */
  async createChatSession(notebookId, data = {}) {
    return apiClient.post(`/notebooks/${notebookId}/chats`, data);
  },

  /**
   * Get all chat sessions for a notebook
   * @param {string} notebookId
   */
  async getChatSessions(notebookId) {
    return apiClient.get(`/notebooks/${notebookId}/chats`);
  },

  /**
   * Get single chat session by ID
   * @param {string} notebookId
   * @param {string} sessionId
   */
  async getChatSession(notebookId, sessionId) {
    return apiClient.get(`/notebooks/${notebookId}/chats/${sessionId}`);
  },

  /**
   * Delete a chat session and its history
   * @param {string} notebookId
   * @param {string} sessionId
   */
  async deleteChatSession(notebookId, sessionId) {
    return apiClient.delete(`/notebooks/${notebookId}/chats/${sessionId}`);
  },

  /**
   * Get all messages for a chat session
   * @param {string} notebookId
   * @param {string} sessionId
   */
  async getChatMessages(notebookId, sessionId) {
    return apiClient.get(`/notebooks/${notebookId}/chats/${sessionId}/messages`);
  },

  /**
   * Send a message to a chat session and receive grounded AI answer
   * @param {string} notebookId
   * @param {string} sessionId
   * @param {{ message: string, topK?: number, scoreThreshold?: number }} data
   */
  async sendMessage(notebookId, sessionId, data) {
    return apiClient.post(`/notebooks/${notebookId}/chats/${sessionId}/messages`, data);
  },
};
