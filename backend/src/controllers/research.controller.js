const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const Notebook = require('../models/Notebook');
const researchService = require('../services/research/researchService');

/**
 * Verify notebook ownership
 */
async function verifyNotebookAccess(notebookId, userId) {
  if (!notebookId || !mongoose.Types.ObjectId.isValid(notebookId)) {
    throw new ApiError(400, 'Invalid notebook ID format');
  }

  const notebook = await Notebook.findOne({
    _id: notebookId,
    ownerId: userId,
  });

  if (!notebook) {
    throw new ApiError(404, 'Notebook not found or access denied');
  }

  return notebook;
}

/**
 * @route   POST /api/notebooks/:notebookId/research
 * @desc    Execute grounded research query with provenance & multi-source citations
 * @access  Private
 */
const runResearch = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { query, sourceScope = 'all', topK = 8 } = req.body || {};

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new ApiError(400, 'Research query is required');
  }

  if (sourceScope && !['notebook', 'web', 'all'].includes(sourceScope)) {
    throw new ApiError(400, 'Invalid sourceScope. Allowed values: notebook, web, all');
  }

  try {
    const result = await researchService.executeResearch({
      notebookId,
      userId: req.user._id,
      query: query.trim(),
      sourceScope,
      topK,
    });

    return ApiResponse.success(
      res,
      result,
      'Research synthesis generated successfully',
      200
    );
  } catch (err) {
    throw new ApiError(500, err.message || 'Research execution failed');
  }
});

module.exports = {
  runResearch,
};
