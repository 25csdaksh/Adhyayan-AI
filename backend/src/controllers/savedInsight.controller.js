const SavedInsight = require('../models/SavedInsight');
const Notebook = require('../models/Notebook');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logActivity } = require('../services/activity/activityService');

/**
 * @desc Get saved insights for a notebook
 * @route GET /api/notebooks/:notebookId/insights
 * @access Private
 */
const getSavedInsights = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { search, tag, pinned } = req.query;

  const query = { notebookId, userId: req.user._id };

  if (pinned !== undefined) {
    query.pinned = pinned === 'true';
  }

  if (tag) {
    query.tags = tag.toLowerCase();
  }

  if (search) {
    const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [{ title: { $regex: escaped, $options: 'i' } }, { content: { $regex: escaped, $options: 'i' } }];
  }

  const insights = await SavedInsight.find(query).sort({ pinned: -1, createdAt: -1 }).lean();

  return ApiResponse.success(res, { insights }, 'Saved insights retrieved', 200);
});

/**
 * @desc Save a new research insight
 * @route POST /api/notebooks/:notebookId/insights
 * @access Private
 */
const createSavedInsight = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { title, content, sourceReferences = [], tags = [], pinned = false } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw ApiError.badRequest('Insight title is required.');
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw ApiError.badRequest('Insight content is required.');
  }

  const notebook = await Notebook.findOne({ _id: notebookId, ownerId: req.user._id });
  if (!notebook) {
    throw ApiError.notFound('Notebook not found or access denied.');
  }

  const cleanTags = Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase()) : [];

  const insight = await SavedInsight.create({
    notebookId,
    userId: req.user._id,
    title: title.trim(),
    content: content.trim(),
    sourceReferences,
    tags: cleanTags,
    pinned: Boolean(pinned),
  });

  logActivity({
    notebookId,
    userId: req.user._id,
    action: 'insight_saved',
    title: 'Saved Research Insight',
    details: insight.title,
  });

  return ApiResponse.success(res, { insight }, 'Insight saved successfully', 201);
});

/**
 * @desc Update a saved insight
 * @route PATCH /api/notebooks/:notebookId/insights/:id
 * @access Private
 */
const updateSavedInsight = asyncHandler(async (req, res) => {
  const { notebookId, id } = req.params;
  const { title, content, tags, pinned } = req.body;

  const insight = await SavedInsight.findOne({ _id: id, notebookId, userId: req.user._id });
  if (!insight) {
    throw ApiError.notFound('Saved insight not found or access denied.');
  }

  if (title !== undefined) insight.title = String(title).trim();
  if (content !== undefined) insight.content = String(content).trim();
  if (pinned !== undefined) insight.pinned = Boolean(pinned);
  if (tags !== undefined && Array.isArray(tags)) {
    insight.tags = tags.map((t) => String(t).trim().toLowerCase());
  }

  await insight.save();
  return ApiResponse.success(res, { insight }, 'Insight updated successfully', 200);
});

/**
 * @desc Delete a saved insight
 * @route DELETE /api/notebooks/:notebookId/insights/:id
 * @access Private
 */
const deleteSavedInsight = asyncHandler(async (req, res) => {
  const { notebookId, id } = req.params;

  const insight = await SavedInsight.findOneAndDelete({ _id: id, notebookId, userId: req.user._id });
  if (!insight) {
    throw ApiError.notFound('Saved insight not found or access denied.');
  }

  return ApiResponse.success(res, null, 'Saved insight deleted successfully', 200);
});

module.exports = {
  getSavedInsights,
  createSavedInsight,
  updateSavedInsight,
  deleteSavedInsight,
};
