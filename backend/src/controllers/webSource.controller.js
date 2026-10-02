const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const Notebook = require('../models/Notebook');
const webSourceService = require('../services/web/webSourceService');

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
 * @route   POST /api/notebooks/:notebookId/web-sources
 * @desc    Ingest a new web source into the notebook
 * @access  Private
 */
const createWebSource = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { url } = req.body || {};

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new ApiError(400, 'Web page URL is required');
  }

  try {
    const webSource = await webSourceService.ingestWebSource({
      notebookId,
      userId: req.user._id,
      url: url.trim(),
    });

    return ApiResponse.success(
      res,
      { webSource },
      'Web source added and processed successfully',
      201
    );
  } catch (err) {
    throw new ApiError(400, err.message || 'Failed to ingest web source');
  }
});

/**
 * @route   GET /api/notebooks/:notebookId/web-sources
 * @desc    Get all web sources for this notebook
 * @access  Private
 */
const getWebSources = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  await verifyNotebookAccess(notebookId, req.user._id);

  const data = await webSourceService.getWebSources({
    notebookId,
    userId: req.user._id,
    page,
    limit,
  });

  return ApiResponse.success(
    res,
    data,
    'Web sources retrieved successfully',
    200
  );
});

/**
 * @route   GET /api/notebooks/:notebookId/web-sources/:webSourceId
 * @desc    Get single web source details
 * @access  Private
 */
const getWebSourceById = asyncHandler(async (req, res) => {
  const { notebookId, webSourceId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!webSourceId || !mongoose.Types.ObjectId.isValid(webSourceId)) {
    throw new ApiError(400, 'Invalid web source ID format');
  }

  const webSource = await webSourceService.getWebSourceById({
    notebookId,
    webSourceId,
    userId: req.user._id,
  });

  if (!webSource) {
    throw new ApiError(404, 'Web source not found or access denied');
  }

  return ApiResponse.success(
    res,
    { webSource },
    'Web source retrieved successfully',
    200
  );
});

/**
 * @route   POST /api/notebooks/:notebookId/web-sources/:webSourceId/refresh
 * @desc    Force refresh a web source
 * @access  Private
 */
const refreshWebSource = asyncHandler(async (req, res) => {
  const { notebookId, webSourceId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!webSourceId || !mongoose.Types.ObjectId.isValid(webSourceId)) {
    throw new ApiError(400, 'Invalid web source ID format');
  }

  const existing = await webSourceService.getWebSourceById({
    notebookId,
    webSourceId,
    userId: req.user._id,
  });

  if (!existing) {
    throw new ApiError(404, 'Web source not found or access denied');
  }

  try {
    const updated = await webSourceService.ingestWebSource({
      notebookId,
      userId: req.user._id,
      url: existing.canonicalUrl || existing.url,
      forceRefresh: true,
    });

    return ApiResponse.success(
      res,
      { webSource: updated },
      'Web source refreshed successfully',
      200
    );
  } catch (err) {
    throw new ApiError(400, err.message || 'Failed to refresh web source');
  }
});

/**
 * @route   DELETE /api/notebooks/:notebookId/web-sources/:webSourceId
 * @desc    Delete a web source and its chunks
 * @access  Private
 */
const deleteWebSource = asyncHandler(async (req, res) => {
  const { notebookId, webSourceId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!webSourceId || !mongoose.Types.ObjectId.isValid(webSourceId)) {
    throw new ApiError(400, 'Invalid web source ID format');
  }

  const deleted = await webSourceService.deleteWebSource({
    notebookId,
    webSourceId,
    userId: req.user._id,
  });

  if (!deleted) {
    throw new ApiError(404, 'Web source not found or access denied');
  }

  return ApiResponse.success(
    res,
    { id: webSourceId },
    'Web source deleted successfully',
    200
  );
});

module.exports = {
  createWebSource,
  getWebSources,
  getWebSourceById,
  refreshWebSource,
  deleteWebSource,
};
