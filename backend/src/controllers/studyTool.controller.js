const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const Notebook = require('../models/Notebook');
const StudyToolResult = require('../models/StudyToolResult');
const studyToolService = require('../services/studyTools/studyToolService');

/**
 * Helper to verify notebook ownership
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
 * @route   POST /api/notebooks/:notebookId/study-tools/summary
 * @desc    Generate a grounded summary
 * @access  Private
 */
const createSummary = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { mode = 'detailed', topic = '' } = req.body || {};

  await verifyNotebookAccess(notebookId, req.user._id);

  if (mode && !['short', 'detailed'].includes(mode)) {
    throw new ApiError(400, 'Invalid summary mode. Allowed values: short, detailed');
  }

  try {
    const studyRecord = await studyToolService.generateSummary({
      notebookId,
      userId: req.user._id,
      mode,
      topic,
    });

    return ApiResponse.success(
      res,
      { studyTool: studyRecord },
      'Summary generated successfully',
      201
    );
  } catch (err) {
    if (err.message === studyToolService.INSUFFICIENT_INFO_MSG) {
      throw new ApiError(400, err.message);
    }
    throw new ApiError(500, err.message || 'Failed to generate summary');
  }
});

/**
 * @route   POST /api/notebooks/:notebookId/study-tools/flashcards
 * @desc    Generate grounded flashcards
 * @access  Private
 */
const createFlashcards = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { count = 10, difficulty = 'mixed', topic = '' } = req.body || {};

  await verifyNotebookAccess(notebookId, req.user._id);

  const parsedCount = parseInt(count, 10);
  if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 30) {
    throw new ApiError(400, 'Flashcards count must be an integer between 1 and 30');
  }

  if (difficulty && !['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
    throw new ApiError(400, 'Invalid difficulty. Allowed values: easy, medium, hard, mixed');
  }

  try {
    const studyRecord = await studyToolService.generateFlashcards({
      notebookId,
      userId: req.user._id,
      count: parsedCount,
      difficulty,
      topic,
    });

    return ApiResponse.success(
      res,
      { studyTool: studyRecord },
      'Flashcards generated successfully',
      201
    );
  } catch (err) {
    if (err.message === studyToolService.INSUFFICIENT_INFO_MSG) {
      throw new ApiError(400, err.message);
    }
    throw new ApiError(500, err.message || 'Failed to generate flashcards');
  }
});

/**
 * @route   POST /api/notebooks/:notebookId/study-tools/quiz
 * @desc    Generate grounded multiple choice quiz
 * @access  Private
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { count = 10, difficulty = 'mixed', topic = '' } = req.body || {};

  await verifyNotebookAccess(notebookId, req.user._id);

  const parsedCount = parseInt(count, 10);
  if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 20) {
    throw new ApiError(400, 'Quiz questions count must be an integer between 1 and 20');
  }

  if (difficulty && !['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
    throw new ApiError(400, 'Invalid difficulty. Allowed values: easy, medium, hard, mixed');
  }

  try {
    const studyRecord = await studyToolService.generateQuiz({
      notebookId,
      userId: req.user._id,
      count: parsedCount,
      difficulty,
      topic,
    });

    return ApiResponse.success(
      res,
      { studyTool: studyRecord },
      'Quiz generated successfully',
      201
    );
  } catch (err) {
    if (err.message === studyToolService.INSUFFICIENT_INFO_MSG) {
      throw new ApiError(400, err.message);
    }
    throw new ApiError(500, err.message || 'Failed to generate quiz');
  }
});

/**
 * @route   POST /api/notebooks/:notebookId/study-tools/mindmap
 * @desc    Generate grounded hierarchical mind map
 * @access  Private
 */
const createMindMap = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { topic = '' } = req.body || {};

  await verifyNotebookAccess(notebookId, req.user._id);

  try {
    const studyRecord = await studyToolService.generateMindMap({
      notebookId,
      userId: req.user._id,
      topic,
    });

    return ApiResponse.success(
      res,
      { studyTool: studyRecord },
      'Mind map generated successfully',
      201
    );
  } catch (err) {
    if (err.message === studyToolService.INSUFFICIENT_INFO_MSG) {
      throw new ApiError(400, err.message);
    }
    throw new ApiError(500, err.message || 'Failed to generate mind map');
  }
});

/**
 * @route   GET /api/notebooks/:notebookId/study-tools
 * @desc    Get user's generated study tools for this notebook
 * @access  Private
 */
const getStudyTools = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { toolType, page = 1, limit = 20 } = req.query;

  await verifyNotebookAccess(notebookId, req.user._id);

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {
    notebookId,
    userId: req.user._id,
  };

  if (toolType && ['summary', 'flashcards', 'quiz', 'mindmap'].includes(toolType)) {
    query.toolType = toolType;
  }

  const [studyTools, total] = await Promise.all([
    StudyToolResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    StudyToolResult.countDocuments(query),
  ]);

  return ApiResponse.success(
    res,
    {
      studyTools,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
    'Study tools retrieved successfully',
    200
  );
});

/**
 * @route   GET /api/notebooks/:notebookId/study-tools/:studyToolId
 * @desc    Get single study tool result
 * @access  Private
 */
const getStudyToolById = asyncHandler(async (req, res) => {
  const { notebookId, studyToolId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!studyToolId || !mongoose.Types.ObjectId.isValid(studyToolId)) {
    throw new ApiError(400, 'Invalid study tool ID format');
  }

  const studyTool = await StudyToolResult.findOne({
    _id: studyToolId,
    notebookId,
    userId: req.user._id,
  });

  if (!studyTool) {
    throw new ApiError(404, 'Study tool not found or access denied');
  }

  return ApiResponse.success(
    res,
    { studyTool },
    'Study tool retrieved successfully',
    200
  );
});

/**
 * @route   DELETE /api/notebooks/:notebookId/study-tools/:studyToolId
 * @desc    Delete study tool result
 * @access  Private
 */
const deleteStudyTool = asyncHandler(async (req, res) => {
  const { notebookId, studyToolId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);

  if (!studyToolId || !mongoose.Types.ObjectId.isValid(studyToolId)) {
    throw new ApiError(400, 'Invalid study tool ID format');
  }

  const deleted = await StudyToolResult.findOneAndDelete({
    _id: studyToolId,
    notebookId,
    userId: req.user._id,
  });

  if (!deleted) {
    throw new ApiError(404, 'Study tool not found or access denied');
  }

  return ApiResponse.success(
    res,
    { id: studyToolId },
    'Study tool deleted successfully',
    200
  );
});

module.exports = {
  createSummary,
  createFlashcards,
  createQuiz,
  createMindMap,
  getStudyTools,
  getStudyToolById,
  deleteStudyTool,
};
