const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { performUniversalSearch } = require('../services/search/universalSearchService');

/**
 * @desc Multi-category universal search across notebook entities
 * @route GET /api/notebooks/:notebookId/universal-search
 * @access Private
 */
const searchAll = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { q, category, limit } = req.query;

  const result = await performUniversalSearch({
    notebookId,
    userId: req.user._id,
    query: q || '',
    category: category || 'all',
    limit: parseInt(limit, 10) || 15,
  });

  return ApiResponse.success(res, result, 'Universal search completed', 200);
});

module.exports = {
  searchAll,
};
