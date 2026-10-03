const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { getNotebookActivity } = require('../services/activity/activityService');

/**
 * @desc Get research activity timeline for a notebook
 * @route GET /api/notebooks/:notebookId/activity
 * @access Private
 */
const getActivity = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { page, limit } = req.query;

  const result = await getNotebookActivity({
    notebookId,
    userId: req.user._id,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });

  return ApiResponse.success(res, result, 'Activity timeline retrieved', 200);
});

module.exports = {
  getActivity,
};
