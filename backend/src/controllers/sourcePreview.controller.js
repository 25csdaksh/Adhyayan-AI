const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { getChunkPreviewContext } = require('../services/preview/sourcePreviewService');

/**
 * @desc Get deep link chunk preview context with adjacent chunks
 * @route GET /api/notebooks/:notebookId/chunks/:chunkId/preview
 * @access Private
 */
const getChunkPreview = asyncHandler(async (req, res) => {
  const { notebookId, chunkId } = req.params;

  const preview = await getChunkPreviewContext({
    notebookId,
    chunkId,
    userId: req.user._id,
  });

  return ApiResponse.success(res, preview, 'Chunk preview context retrieved', 200);
});

module.exports = {
  getChunkPreview,
};
