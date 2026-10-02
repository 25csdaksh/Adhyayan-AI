import apiClient from './apiClient';

/**
 * Generate a grounded summary for a notebook
 * @param {string} notebookId
 * @param {Object} params
 * @param {'short'|'detailed'} [params.mode='detailed']
 * @param {string} [params.topic]
 */
export const generateSummary = async (notebookId, { mode = 'detailed', topic = '' } = {}) => {
  const response = await apiClient.post(`/notebooks/${notebookId}/study-tools/summary`, {
    mode,
    topic,
  });
  return response.data?.data?.studyTool;
};

/**
 * Generate grounded flashcards for a notebook
 * @param {string} notebookId
 * @param {Object} params
 * @param {number} [params.count=10]
 * @param {'easy'|'medium'|'hard'|'mixed'} [params.difficulty='mixed']
 * @param {string} [params.topic]
 */
export const generateFlashcards = async (
  notebookId,
  { count = 10, difficulty = 'mixed', topic = '' } = {}
) => {
  const response = await apiClient.post(`/notebooks/${notebookId}/study-tools/flashcards`, {
    count,
    difficulty,
    topic,
  });
  return response.data?.data?.studyTool;
};

/**
 * Generate a grounded multiple-choice quiz for a notebook
 * @param {string} notebookId
 * @param {Object} params
 * @param {number} [params.count=10]
 * @param {'easy'|'medium'|'hard'|'mixed'} [params.difficulty='mixed']
 * @param {string} [params.topic]
 */
export const generateQuiz = async (
  notebookId,
  { count = 10, difficulty = 'mixed', topic = '' } = {}
) => {
  const response = await apiClient.post(`/notebooks/${notebookId}/study-tools/quiz`, {
    count,
    difficulty,
    topic,
  });
  return response.data?.data?.studyTool;
};

/**
 * Generate a grounded hierarchical mind map for a notebook
 * @param {string} notebookId
 * @param {Object} params
 * @param {string} [params.topic]
 */
export const generateMindMap = async (notebookId, { topic = '' } = {}) => {
  const response = await apiClient.post(`/notebooks/${notebookId}/study-tools/mindmap`, {
    topic,
  });
  return response.data?.data?.studyTool;
};

/**
 * Get all study tools generated for a notebook
 * @param {string} notebookId
 * @param {Object} [params]
 * @param {string} [params.toolType]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getStudyTools = async (notebookId, { toolType, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (toolType) params.toolType = toolType;

  const response = await apiClient.get(`/notebooks/${notebookId}/study-tools`, {
    params,
  });
  return response.data?.data;
};

/**
 * Get a single study tool by ID
 * @param {string} notebookId
 * @param {string} studyToolId
 */
export const getStudyToolById = async (notebookId, studyToolId) => {
  const response = await apiClient.get(`/notebooks/${notebookId}/study-tools/${studyToolId}`);
  return response.data?.data?.studyTool;
};

/**
 * Delete a study tool by ID
 * @param {string} notebookId
 * @param {string} studyToolId
 */
export const deleteStudyTool = async (notebookId, studyToolId) => {
  const response = await apiClient.delete(`/notebooks/${notebookId}/study-tools/${studyToolId}`);
  return response.data?.data;
};
