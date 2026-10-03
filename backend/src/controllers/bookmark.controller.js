const Bookmark = require('../models/Bookmark');
const Notebook = require('../models/Notebook');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc Get bookmarks for a notebook with optional type filtering
 * @route GET /api/notebooks/:notebookId/bookmarks
 * @access Private
 */
const getBookmarks = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { targetType } = req.query;

  const query = { notebookId, userId: req.user._id };
  if (targetType) {
    query.targetType = targetType;
  }

  const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 }).lean();

  return ApiResponse.success(res, { bookmarks }, 'Bookmarks retrieved', 200);
});

/**
 * @desc Add a bookmark (or return existing)
 * @route POST /api/notebooks/:notebookId/bookmarks
 * @access Private
 */
const addBookmark = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { targetType, targetId, title, snippet = '', metadata = {} } = req.body;

  if (!targetType || !targetId || !title) {
    throw ApiError.badRequest('targetType, targetId, and title are required.');
  }

  const notebook = await Notebook.findOne({ _id: notebookId, ownerId: req.user._id });
  if (!notebook) {
    throw ApiError.notFound('Notebook not found or access denied.');
  }

  // Find existing or create
  let bookmark = await Bookmark.findOne({
    userId: req.user._id,
    targetType,
    targetId,
  });

  if (bookmark) {
    return ApiResponse.success(res, { bookmark }, 'Item is already bookmarked', 200);
  }

  bookmark = await Bookmark.create({
    notebookId,
    userId: req.user._id,
    targetType,
    targetId,
    title: String(title).trim(),
    snippet: String(snippet).trim(),
    metadata,
  });

  return ApiResponse.success(res, { bookmark }, 'Bookmark added successfully', 201);
});

/**
 * @desc Remove a bookmark
 * @route DELETE /api/notebooks/:notebookId/bookmarks/:id
 * @access Private
 */
const removeBookmark = asyncHandler(async (req, res) => {
  const { notebookId, id } = req.params;

  const bookmark = await Bookmark.findOneAndDelete({
    _id: id,
    notebookId,
    userId: req.user._id,
  });

  if (!bookmark) {
    throw ApiError.notFound('Bookmark not found or access denied.');
  }

  return ApiResponse.success(res, null, 'Bookmark removed successfully', 200);
});

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
};
