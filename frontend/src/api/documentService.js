import apiClient from './apiClient';

export const documentService = {
  /**
   * Upload a file source (PDF, DOCX, TXT)
   * @param {string} notebookId
   * @param {FormData} formData
   * @param {Function} [onUploadProgress]
   */
  async uploadDocument(notebookId, formData, onUploadProgress) {
    return apiClient.post(`/notebooks/${notebookId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  /**
   * Create a plain text note source
   * @param {string} notebookId
   * @param {{ title: string, text: string }} data
   */
  async createTextSource(notebookId, data) {
    return apiClient.post(`/notebooks/${notebookId}/documents`, {
      sourceType: 'text',
      title: data.title,
      text: data.text,
    });
  },

  /**
   * Create a web URL source
   * @param {string} notebookId
   * @param {{ title: string, url: string }} data
   */
  async createUrlSource(notebookId, data) {
    return apiClient.post(`/notebooks/${notebookId}/documents`, {
      sourceType: 'url',
      title: data.title,
      url: data.url,
    });
  },

  /**
   * Get all documents/sources for a notebook
   * @param {string} notebookId
   * @param {Object} [params] - page, limit, search
   */
  async getDocuments(notebookId, params = {}) {
    return apiClient.get(`/notebooks/${notebookId}/documents`, { params });
  },

  /**
   * Get a single document source by ID
   * @param {string} notebookId
   * @param {string} documentId
   */
  async getDocument(notebookId, documentId) {
    return apiClient.get(`/notebooks/${notebookId}/documents/${documentId}`);
  },

  /**
   * Get document processing status
   * @param {string} notebookId
   * @param {string} documentId
   */
  async getDocumentStatus(notebookId, documentId) {
    return apiClient.get(`/notebooks/${notebookId}/documents/${documentId}/status`);
  },

  /**
   * Trigger re-processing for a document
   * @param {string} notebookId
   * @param {string} documentId
   */
  async reprocessDocument(notebookId, documentId) {
    return apiClient.post(`/notebooks/${notebookId}/documents/${documentId}/process`);
  },

  /**
   * Get extracted chunks for a document
   * @param {string} notebookId
   * @param {string} documentId
   * @param {Object} [params] - page, limit
   */
  async getDocumentChunks(notebookId, documentId, params = {}) {
    return apiClient.get(`/notebooks/${notebookId}/documents/${documentId}/chunks`, { params });
  },

  /**
   * Update document title or metadata
   * @param {string} notebookId
   * @param {string} documentId
   * @param {{ title: string }} data
   */
  async updateDocument(notebookId, documentId, data) {
    return apiClient.patch(`/notebooks/${notebookId}/documents/${documentId}`, data);
  },

  /**
   * Delete a document source
   * @param {string} notebookId
   * @param {string} documentId
   */
  async deleteDocument(notebookId, documentId) {
    return apiClient.delete(`/notebooks/${notebookId}/documents/${documentId}`);
  },

  /**
   * Trigger re-embedding for a document
   * @param {string} notebookId
   * @param {string} documentId
   */
  async reembedDocument(notebookId, documentId) {
    return apiClient.post(`/notebooks/${notebookId}/documents/${documentId}/embed`);
  },

  /**
   * Perform semantic vector search over a notebook's documents
   * @param {string} notebookId
   * @param {{ query: string, topK?: number, scoreThreshold?: number }} searchParams
   */
  async searchNotebook(notebookId, searchParams) {
    return apiClient.post(`/notebooks/${notebookId}/search`, searchParams);
  },

  /**
   * Get structured source intelligence analysis for a document
   * @param {string} notebookId
   * @param {string} documentId
   */
  async getDocumentAnalysis(notebookId, documentId) {
    return apiClient.get(`/notebooks/${notebookId}/documents/${documentId}/analysis`);
  },

  /**
   * Manually trigger/regenerate source analysis for a document
   * @param {string} notebookId
   * @param {string} documentId
   */
  async analyzeDocument(notebookId, documentId) {
    return apiClient.post(`/notebooks/${notebookId}/documents/${documentId}/analyze`);
  },

  /**
   * Get source coverage diagnostics for a document
   * @param {string} notebookId
   * @param {string} documentId
   */
  async getDocumentCoverage(notebookId, documentId) {
    return apiClient.get(`/notebooks/${notebookId}/documents/${documentId}/coverage`);
  },
};
