import apiClient from './apiClient';

/**
 * Execute advanced multi-source research query
 * @param {string} notebookId
 * @param {Object} params
 * @param {string} params.query
 * @param {'notebook'|'web'|'all'} [params.sourceScope='all']
 * @param {number} [params.topK=8]
 */
export const executeResearch = async (
  notebookId,
  { query, sourceScope = 'all', topK = 8 }
) => {
  const response = await apiClient.post(`/notebooks/${notebookId}/research`, {
    query,
    sourceScope,
    topK,
  });
  return response.data?.data;
};
