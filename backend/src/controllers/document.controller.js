const mongoose = require('mongoose');
const path = require('path');
const Document = require('../models/Document');
const Notebook = require('../models/Notebook');
const Chunk = require('../models/Chunk');
const { uploadStream, deleteAsset } = require('../config/cloudinary');
const { processDocument, triggerAsyncProcessing } = require('../services/document/documentProcessor');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * Helper to verify notebook exists and belongs to authenticated user
 */
const verifyNotebookOwnership = async (notebookId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notebookId)) {
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
};

/**
 * @desc Create / Upload a document source (File, Text, or URL)
 * @route POST /api/notebooks/:notebookId/documents
 * @access Private (Authenticated & Notebook Owner)
 */
const createDocument = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  const { title, text, url, sourceType } = req.body;

  // Case 1: Uploaded File (PDF, DOCX, TXT)
  if (req.file) {
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();
    const mimeType = req.file.mimetype;
    const fileSize = req.file.size;

    let detectedType = 'txt';
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      detectedType = 'pdf';
    } else if (
      ext === '.docx' ||
      ext === '.doc' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      detectedType = 'docx';
    } else if (ext === '.txt' || mimeType === 'text/plain') {
      detectedType = 'txt';
    }

    const docTitle = title?.trim() || originalName;
    if (docTitle.length > 200) {
      throw new ApiError(400, 'Document title cannot exceed 200 characters');
    }

    // Stream upload directly to Cloudinary
    let uploadResult;
    try {
      uploadResult = await uploadStream(req.file.buffer, {
        folder: `studylm/notebooks/${notebook._id}/sources`,
        resourceType: 'raw',
      });
    } catch (uploadErr) {
      throw new ApiError(500, `Storage upload failed: ${uploadErr.message}`);
    }

    // Persist Document metadata in MongoDB
    try {
      const document = await Document.create({
        notebookId: notebook._id,
        title: docTitle,
        sourceType: detectedType,
        originalName,
        mimeType,
        fileSize,
        storageUrl: uploadResult.secure_url || '',
        storagePublicId: uploadResult.public_id || '',
        status: 'pending',
        rawText: '',
      });

      // Trigger asynchronous processing pipeline
      triggerAsyncProcessing(document._id, { directBuffer: req.file.buffer });

      return ApiResponse.success(res, { document }, 'Document uploaded successfully', 201);
    } catch (dbErr) {
      if (uploadResult?.public_id) {
        await deleteAsset(uploadResult.public_id, 'raw');
      }
      throw dbErr;
    }
  }

  // Case 2: Plain Text Source
  if (sourceType === 'text' || (text !== undefined && text !== null && !url)) {
    if (!text || !text.trim()) {
      throw new ApiError(400, 'Text content is required for text source');
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 100000) {
      throw new ApiError(400, 'Text content exceeds maximum allowed size (100,000 characters)');
    }

    const docTitle = title?.trim() || 'Untitled Note';
    if (docTitle.length > 200) {
      throw new ApiError(400, 'Document title cannot exceed 200 characters');
    }

    const document = await Document.create({
      notebookId: notebook._id,
      title: docTitle,
      sourceType: 'text',
      rawText: trimmedText,
      fileSize: Buffer.byteLength(trimmedText, 'utf8'),
      status: 'pending',
    });

    // Trigger asynchronous processing pipeline
    triggerAsyncProcessing(document._id);

    return ApiResponse.success(res, { document }, 'Text source created successfully', 201);
  }

  // Case 3: URL Source
  if (sourceType === 'url' || url) {
    if (!url || !url.trim()) {
      throw new ApiError(400, 'Web URL is required for URL source');
    }

    const trimmedUrl = url.trim();
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error();
      }
    } catch {
      throw new ApiError(400, 'Please provide a valid web URL starting with http:// or https://');
    }

    const docTitle = title?.trim() || trimmedUrl;
    if (docTitle.length > 200) {
      throw new ApiError(400, 'Document title cannot exceed 200 characters');
    }

    const document = await Document.create({
      notebookId: notebook._id,
      title: docTitle,
      sourceType: 'url',
      sourceUrl: trimmedUrl,
      status: 'pending',
    });

    // Trigger asynchronous processing pipeline
    triggerAsyncProcessing(document._id);

    return ApiResponse.success(res, { document }, 'URL source created successfully', 201);
  }

  throw new ApiError(400, 'Please provide a file, text content, or URL to add as a source');
});

/**
 * @desc Get all documents for a notebook
 * @route GET /api/notebooks/:notebookId/documents
 * @access Private (Authenticated & Notebook Owner)
 */
const getDocuments = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim();

  const query = { notebookId: notebook._id };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { originalName: { $regex: search, $options: 'i' } },
      { sourceUrl: { $regex: search, $options: 'i' } },
    ];
  }

  const [documents, total] = await Promise.all([
    Document.find(query)
      .select('-rawText') // Avoid loading heavy rawText in list queries
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Document.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return ApiResponse.success(
    res,
    {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
    'Documents fetched successfully',
    200
  );
});

/**
 * @desc Get a single document by ID
 * @route GET /api/notebooks/:notebookId/documents/:documentId
 * @access Private (Authenticated & Notebook Owner)
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const { notebookId, documentId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, 'Invalid document ID format');
  }

  const document = await Document.findOne({
    _id: documentId,
    notebookId: notebook._id,
  }).lean();

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  return ApiResponse.success(res, { document }, 'Document fetched successfully', 200);
});

/**
 * @desc Get document processing status
 * @route GET /api/notebooks/:notebookId/documents/:documentId/status
 * @access Private (Authenticated & Notebook Owner)
 */
const getDocumentStatus = asyncHandler(async (req, res) => {
  const { notebookId, documentId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, 'Invalid document ID format');
  }

  const document = await Document.findOne({
    _id: documentId,
    notebookId: notebook._id,
  })
    .select('status processingError metadata title sourceType updatedAt')
    .lean();

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  return ApiResponse.success(res, { document }, 'Document status retrieved', 200);
});

/**
 * @desc Manually retry / re-process document
 * @route POST /api/notebooks/:notebookId/documents/:documentId/process
 * @access Private (Authenticated & Notebook Owner)
 */
const reprocessDocument = asyncHandler(async (req, res) => {
  const { notebookId, documentId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, 'Invalid document ID format');
  }

  const document = await Document.findOne({
    _id: documentId,
    notebookId: notebook._id,
  });

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  triggerAsyncProcessing(document._id);

  return ApiResponse.success(
    res,
    { documentId: document._id, status: 'processing' },
    'Document processing initiated',
    200
  );
});

/**
 * @desc Get extracted chunks for a document
 * @route GET /api/notebooks/:notebookId/documents/:documentId/chunks
 * @access Private (Authenticated & Notebook Owner)
 */
const getDocumentChunks = asyncHandler(async (req, res) => {
  const { notebookId, documentId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, 'Invalid document ID format');
  }

  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
  const skip = (page - 1) * limit;

  const [chunks, total] = await Promise.all([
    Chunk.find({ documentId, notebookId: notebook._id })
      .sort({ chunkIndex: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Chunk.countDocuments({ documentId, notebookId: notebook._id }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return ApiResponse.success(
    res,
    {
      chunks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
    'Document chunks fetched successfully',
    200
  );
});

/**
 * @desc Update document metadata (title)
 * @route PATCH /api/notebooks/:notebookId/documents/:documentId
 * @access Private (Authenticated & Notebook Owner)
 */
const updateDocument = asyncHandler(async (req, res) => {
  const { notebookId, documentId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, 'Invalid document ID format');
  }

  const { title } = req.body;
  if (!title || !title.trim()) {
    throw new ApiError(400, 'Document title is required');
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 200) {
    throw new ApiError(400, 'Document title cannot exceed 200 characters');
  }

  const document = await Document.findOneAndUpdate(
    { _id: documentId, notebookId: notebook._id },
    { title: trimmedTitle },
    { new: true, runValidators: true }
  );

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  return ApiResponse.success(res, { document }, 'Document updated successfully', 200);
});

/**
 * @desc Delete document, its Chunks, and its Cloudinary storage asset
 * @route DELETE /api/notebooks/:notebookId/documents/:documentId
 * @access Private (Authenticated & Notebook Owner)
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const { notebookId, documentId } = req.params;
  const notebook = await verifyNotebookOwnership(notebookId, req.user._id);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, 'Invalid document ID format');
  }

  const document = await Document.findOne({
    _id: documentId,
    notebookId: notebook._id,
  });

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  // 1. Delete associated Chunks to avoid orphaned data
  await Chunk.deleteMany({ documentId: document._id });

  // 2. Delete Cloudinary asset if one exists
  if (document.storagePublicId) {
    await deleteAsset(document.storagePublicId, 'raw');
  }

  // 3. Delete Document record
  await Document.findByIdAndDelete(document._id);

  return ApiResponse.success(res, null, 'Document deleted successfully', 200);
});

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  getDocumentStatus,
  reprocessDocument,
  getDocumentChunks,
  updateDocument,
  deleteDocument,
  verifyNotebookOwnership,
};
