const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const {
  getUserMemories,
  createUserMemory,
  updateUserMemory,
  deleteUserMemory,
} = require('../services/memory/userMemoryService');

/**
 * @desc Get user research memories with filtering and pagination
 * @route GET /api/memory
 * @access Private
 */
const getMemories = asyncHandler(async (req, res) => {
  const { type, active, search, page, limit } = req.query;

  const result = await getUserMemories({
    userId: req.user._id,
    type,
    active,
    search,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });

  return ApiResponse.success(res, result, 'User memories retrieved successfully', 200);
});

/**
 * @desc Create explicit user research memory
 * @route POST /api/memory
 * @access Private
 */
const createMemory = asyncHandler(async (req, res) => {
  const { type, content, tags, source, metadata } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw ApiError.badRequest('Memory content is required.');
  }

  const memory = await createUserMemory({
    userId: req.user._id,
    type,
    content,
    tags,
    source,
    metadata,
  });

  return ApiResponse.success(res, { memory }, 'Research memory saved successfully', 201);
});

/**
 * @desc Update user research memory
 * @route PATCH /api/memory/:id
 * @access Private
 */
const updateMemory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const memory = await updateUserMemory({
    memoryId: id,
    userId: req.user._id,
    updateData: req.body,
  });

  return ApiResponse.success(res, { memory }, 'Research memory updated successfully', 200);
});

/**
 * @desc Delete user research memory
 * @route DELETE /api/memory/:id
 * @access Private
 */
const deleteMemory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteUserMemory({
    memoryId: id,
    userId: req.user._id,
  });

  return ApiResponse.success(res, null, 'Research memory deleted successfully', 200);
});

module.exports = {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
};
