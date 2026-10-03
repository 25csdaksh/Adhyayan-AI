const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const {
  detectNotebookSourceRelationships,
  getNotebookSourceRelationships,
} = require('../services/relationship/sourceRelationshipService');

/**
 * @desc Get source relationships for a notebook
 * @route GET /api/notebooks/:notebookId/relationships
 * @access Private
 */
const getRelationships = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const relationships = await getNotebookSourceRelationships({
    notebookId,
    userId: req.user._id,
  });

  return ApiResponse.success(res, { relationships }, 'Source relationships retrieved', 200);
});

/**
 * @desc Force re-detection of source relationships for a notebook
 * @route POST /api/notebooks/:notebookId/relationships/detect
 * @access Private
 */
const detectRelationships = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const relationships = await detectNotebookSourceRelationships({
    notebookId,
    userId: req.user._id,
  });

  return ApiResponse.success(res, { relationships }, 'Source relationships detected successfully', 200);
});

module.exports = {
  getRelationships,
  detectRelationships,
};
