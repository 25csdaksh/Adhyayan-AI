const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const {
  getNotebookMemory,
  updateNotebookMemory,
} = require('../services/memory/notebookMemoryService');

/**
 * @desc Get notebook memory context
 * @route GET /api/notebooks/:notebookId/memory
 * @access Private
 */
const getMemory = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const memory = await getNotebookMemory({
    notebookId,
    userId: req.user._id,
  });

  return ApiResponse.success(res, { memory }, 'Notebook memory context retrieved', 200);
});

/**
 * @desc Update notebook memory context
 * @route PATCH /api/notebooks/:notebookId/memory
 * @access Private
 */
const updateMemory = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const memory = await updateNotebookMemory({
    notebookId,
    userId: req.user._id,
    updateData: req.body,
  });

  return ApiResponse.success(res, { memory }, 'Notebook memory context updated', 200);
});

module.exports = {
  getMemory,
  updateMemory,
};
