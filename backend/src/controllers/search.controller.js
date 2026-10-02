const mongoose = require('mongoose');
const Notebook = require('../models/Notebook');
const { semanticSearch } = require('../services/search/vectorSearchService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc Perform semantic vector search over notebook sources
 * @route POST /api/notebooks/:notebookId/search
 * @access Private (Authenticated & Notebook Owner)
 */
const searchNotebook = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { query, topK, scoreThreshold } = req.body;

  if (!mongoose.Types.ObjectId.isValid(notebookId)) {
    throw new ApiError(400, 'Invalid notebook ID format');
  }

  // Strictly enforce user ownership of the notebook
  const notebook = await Notebook.findOne({
    _id: notebookId,
    ownerId: req.user._id,
  });

  if (!notebook) {
    throw new ApiError(404, 'Notebook not found or access denied');
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new ApiError(400, 'Search query text is required');
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length > 1000) {
    throw new ApiError(400, 'Search query cannot exceed 1000 characters');
  }

  if (topK !== undefined) {
    const parsedTopK = parseInt(topK, 10);
    if (isNaN(parsedTopK) || parsedTopK < 1 || parsedTopK > 50) {
      throw new ApiError(400, 'topK parameter must be an integer between 1 and 50');
    }
  }

  if (scoreThreshold !== undefined) {
    const parsedThreshold = parseFloat(scoreThreshold);
    if (isNaN(parsedThreshold) || parsedThreshold < 0 || parsedThreshold > 1) {
      throw new ApiError(400, 'scoreThreshold parameter must be a float between 0.0 and 1.0');
    }
  }

  const searchResult = await semanticSearch({
    notebookId: notebook._id,
    query: trimmedQuery,
    topK,
    scoreThreshold,
  });

  return ApiResponse.success(
    res,
    searchResult,
    'Semantic search completed successfully',
    200
  );
});

module.exports = {
  searchNotebook,
};
