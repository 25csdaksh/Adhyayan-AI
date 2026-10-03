const mongoose = require('mongoose');
const Notebook = require('../models/Notebook');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const StudyToolResult = require('../models/StudyToolResult');
const WebSource = require('../models/WebSource');
const { deleteAsset } = require('../config/cloudinary');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const { checkUsageLimit } = require('../services/usage/entitlementService');
const { getPlan } = require('../config/plans');

/**
 * Validate MongoDB ObjectId
 * @param {string} id
 */
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid notebook identifier format.');
  }
};

/**
 * Create a new notebook
 * POST /api/notebooks
 */
const createNotebook = asyncHandler(async (req, res) => {
  const { title, description, icon } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw ApiError.badRequest('Notebook title is required.');
  }

  if (title.trim().length > 120) {
    throw ApiError.badRequest('Notebook title cannot exceed 120 characters.');
  }

  if (description && description.length > 500) {
    throw ApiError.badRequest('Notebook description cannot exceed 500 characters.');
  }

  // Server-side quota check
  const check = await checkUsageLimit(req.user._id, 'notebooks');
  if (!check.allowed) {
    const planConfig = getPlan(req.user?.plan);
    return res.status(429).json({
      error: 'PLAN_LIMIT_REACHED',
      message: `You have reached your notebook limit of ${check.limit} on the ${planConfig.name} plan. Upgrade to Pro for increased capacity.`,
      metric: 'notebooks',
      currentUsage: check.current,
      limit: check.limit,
      plan: req.user?.plan || 'free',
      upgradeAvailable: true,
    });
  }

  const notebook = await Notebook.create({
    ownerId: req.user._id,
    title: title.trim(),
    description: description ? description.trim() : '',
    icon: icon ? icon.trim() : 'BookOpen',
  });

  return ApiResponse.success(
    res,
    { notebook },
    'Notebook created successfully',
    201
  );
});

/**
 * Get all notebooks for authenticated user with search and pagination
 * GET /api/notebooks
 */
const getNotebooks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const search = req.query.search ? req.query.search.trim() : '';
  const skip = (page - 1) * limit;

  // Build filter strictly scoped by ownerId
  const filter = { ownerId: req.user._id };

  if (search) {
    // Regex search over title and description
    const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const [notebooks, total] = await Promise.all([
    Notebook.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notebook.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return ApiResponse.success(
    res,
    {
      notebooks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
    'Notebooks fetched successfully',
    200
  );
});

/**
 * Get a single notebook by ID
 * GET /api/notebooks/:id
 */
const getNotebookById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id);

  // Strictly query by _id AND ownerId to enforce user isolation
  const notebook = await Notebook.findOne({
    _id: id,
    ownerId: req.user._id,
  });

  if (!notebook) {
    throw ApiError.notFound('Notebook not found or you do not have permission to view it.');
  }

  return ApiResponse.success(
    res,
    { notebook },
    'Notebook retrieved successfully',
    200
  );
});

/**
 * Update an existing notebook
 * PATCH /api/notebooks/:id
 */
const updateNotebook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id);

  const { title, description, icon } = req.body;

  // Build sanitized updates object (prevent modifying ownerId or arbitrary fields)
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw ApiError.badRequest('Notebook title cannot be empty.');
    }
    if (title.trim().length > 120) {
      throw ApiError.badRequest('Notebook title cannot exceed 120 characters.');
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description === 'string' && description.length > 500) {
      throw ApiError.badRequest('Notebook description cannot exceed 500 characters.');
    }
    updates.description = typeof description === 'string' ? description.trim() : '';
  }

  if (icon !== undefined && typeof icon === 'string') {
    updates.icon = icon.trim() || 'BookOpen';
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No valid fields provided for update.');
  }

  const updatedNotebook = await Notebook.findOneAndUpdate(
    { _id: id, ownerId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedNotebook) {
    throw ApiError.notFound('Notebook not found or you do not have permission to modify it.');
  }

  return ApiResponse.success(
    res,
    { notebook: updatedNotebook },
    'Notebook updated successfully',
    200
  );
});

/**
 * Delete a notebook (cascades document, chunk, and Cloudinary asset deletions)
 * DELETE /api/notebooks/:id
 */
const deleteNotebook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id);

  const deletedNotebook = await Notebook.findOneAndDelete({
    _id: id,
    ownerId: req.user._id,
  });

  if (!deletedNotebook) {
    throw ApiError.notFound('Notebook not found or you do not have permission to delete it.');
  }

  // Find all child documents to clean up Cloudinary assets
  try {
    const childDocuments = await Document.find({ notebookId: id });
    for (const doc of childDocuments) {
      if (doc.storagePublicId) {
        await deleteAsset(doc.storagePublicId, 'raw');
      }
    }
    // Remove all child documents, chunks, chat sessions, messages, study tool results, and web sources from MongoDB
    await Document.deleteMany({ notebookId: id });
    await Chunk.deleteMany({ notebookId: id });
    await ChatSession.deleteMany({ notebookId: id });
    await ChatMessage.deleteMany({ notebookId: id });
    await StudyToolResult.deleteMany({ notebookId: id });
    await WebSource.deleteMany({ notebookId: id });
  } catch (cleanupErr) {
    console.warn(`[Notebook Cleanup Warning] Error cleaning child resources for notebook ${id}:`, cleanupErr.message);
  }

  return ApiResponse.success(
    res,
    null,
    'Notebook deleted successfully',
    200
  );
});

module.exports = {
  createNotebook,
  getNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
};
