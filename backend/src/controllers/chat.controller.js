const mongoose = require('mongoose');
const Notebook = require('../models/Notebook');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { generateGroundedResponse } = require('../services/rag/ragService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * Verify notebook ownership for authenticated user
 * @param {string} notebookId
 * @param {string} userId
 */
async function verifyNotebookAccess(notebookId, userId) {
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
}

/**
 * Verify chat session exists and belongs to user & notebook
 * @param {string} sessionId
 * @param {string} notebookId
 * @param {string} userId
 */
async function verifySessionAccess(sessionId, notebookId, userId) {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, 'Invalid chat session ID format');
  }

  const session = await ChatSession.findOne({
    _id: sessionId,
    notebookId,
    userId,
  });

  if (!session) {
    throw new ApiError(404, 'Chat session not found or access denied');
  }

  return session;
}

/**
 * @desc Create a new chat session for a notebook
 * @route POST /api/notebooks/:notebookId/chats
 * @access Private
 */
const createChatSession = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const { title } = req.body;

  const notebook = await verifyNotebookAccess(notebookId, req.user._id);

  const cleanTitle = title && typeof title === 'string' && title.trim().length > 0
    ? title.trim().slice(0, 150)
    : 'New Chat';

  const session = await ChatSession.create({
    notebookId: notebook._id,
    userId: req.user._id,
    title: cleanTitle,
  });

  return ApiResponse.success(res, { session }, 'Chat session created successfully', 201);
});

/**
 * @desc Get all chat sessions for a notebook
 * @route GET /api/notebooks/:notebookId/chats
 * @access Private
 */
const getChatSessions = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;

  const notebook = await verifyNotebookAccess(notebookId, req.user._id);

  const sessions = await ChatSession.find({
    notebookId: notebook._id,
    userId: req.user._id,
  })
    .sort({ updatedAt: -1 })
    .lean();

  return ApiResponse.success(res, { sessions }, 'Chat sessions retrieved', 200);
});

/**
 * @desc Get single chat session by ID
 * @route GET /api/notebooks/:notebookId/chats/:sessionId
 * @access Private
 */
const getChatSessionById = asyncHandler(async (req, res) => {
  const { notebookId, sessionId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);
  const session = await verifySessionAccess(sessionId, notebookId, req.user._id);

  return ApiResponse.success(res, { session }, 'Chat session fetched', 200);
});

/**
 * @desc Delete a chat session and its messages
 * @route DELETE /api/notebooks/:notebookId/chats/:sessionId
 * @access Private
 */
const deleteChatSession = asyncHandler(async (req, res) => {
  const { notebookId, sessionId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);
  const session = await verifySessionAccess(sessionId, notebookId, req.user._id);

  // Cascade delete all chat messages in this session
  await ChatMessage.deleteMany({ sessionId: session._id });
  await ChatSession.findByIdAndDelete(session._id);

  return ApiResponse.success(res, null, 'Chat session and history deleted successfully', 200);
});

/**
 * @desc Get messages for a chat session in chronological order
 * @route GET /api/notebooks/:notebookId/chats/:sessionId/messages
 * @access Private
 */
const getChatMessages = asyncHandler(async (req, res) => {
  const { notebookId, sessionId } = req.params;

  await verifyNotebookAccess(notebookId, req.user._id);
  const session = await verifySessionAccess(sessionId, notebookId, req.user._id);

  const messages = await ChatMessage.find({
    sessionId: session._id,
    notebookId,
    userId: req.user._id,
  })
    .sort({ createdAt: 1 })
    .lean();

  return ApiResponse.success(res, { messages }, 'Messages retrieved successfully', 200);
});

/**
 * @desc Send a message and receive grounded RAG answer with citations
 * @route POST /api/notebooks/:notebookId/chats/:sessionId/messages
 * @access Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { notebookId, sessionId } = req.params;
  const { message, topK, scoreThreshold } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new ApiError(400, 'Message text is required');
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length > 5000) {
    throw new ApiError(400, 'Message cannot exceed 5000 characters');
  }

  const notebook = await verifyNotebookAccess(notebookId, req.user._id);
  const session = await verifySessionAccess(sessionId, notebookId, req.user._id);

  // 1. Fetch recent conversation history for context
  const recentMessages = await ChatMessage.find({
    sessionId: session._id,
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const conversationHistory = recentMessages.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 2. Persist user message
  const userMessage = await ChatMessage.create({
    sessionId: session._id,
    notebookId: notebook._id,
    userId: req.user._id,
    role: 'user',
    content: cleanMessage,
  });

  // 3. Execute Grounded RAG Generation
  let ragResult;
  try {
    ragResult = await generateGroundedResponse({
      notebookId: notebook._id,
      question: cleanMessage,
      history: conversationHistory,
      topK,
      scoreThreshold,
    });
  } catch (ragErr) {
    throw new ApiError(500, ragErr.message || 'Failed to generate grounded AI answer');
  }

  // 4. Persist assistant message with citations
  const assistantMessage = await ChatMessage.create({
    sessionId: session._id,
    notebookId: notebook._id,
    userId: req.user._id,
    role: 'assistant',
    content: ragResult.answer,
    citations: ragResult.citations || [],
    retrieval: ragResult.retrieval || {},
    model: ragResult.model || 'gemini',
  });

  // 5. Update session title if default
  if (session.title === 'New Chat' || !session.title) {
    const generatedTitle = cleanMessage.length > 40
      ? cleanMessage.slice(0, 40) + '...'
      : cleanMessage;
    session.title = generatedTitle;
  }
  session.updatedAt = new Date();
  await session.save();

  return ApiResponse.success(
    res,
    {
      userMessage,
      assistantMessage,
      session: {
        _id: session._id,
        title: session.title,
        updatedAt: session.updatedAt,
      },
    },
    'Message processed and answer generated',
    200
  );
});

module.exports = {
  createChatSession,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
  getChatMessages,
  sendMessage,
};
