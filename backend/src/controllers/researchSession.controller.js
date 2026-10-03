const ResearchSession = require('../models/ResearchSession');
const Notebook = require('../models/Notebook');
const { executeAdvancedResearch } = require('../services/research/advancedResearchService');
const { logActivity } = require('../services/activity/activityService');

/**
 * Run advanced research synthesis and create a persistent session
 * POST /api/notebooks/:notebookId/research-sessions
 */
exports.createResearchSession = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { query, sourceScope = 'all', topK = 10 } = req.body;
    const userId = req.user.id;

    // Validate notebook ownership
    const notebook = await Notebook.findOne({ _id: notebookId, userId });
    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: 'Notebook not found or you do not have permission to access it',
      });
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Research query is required',
      });
    }

    const session = await executeAdvancedResearch({
      notebookId,
      userId,
      query: query.trim(),
      sourceScope,
      topK: Math.min(20, Math.max(1, parseInt(topK, 10) || 10)),
    });

    return res.status(201).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to execute advanced research synthesis',
    });
  }
};

/**
 * Get paginated list of research sessions for a notebook
 * GET /api/notebooks/:notebookId/research-sessions
 */
exports.getResearchSessions = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { page = 1, limit = 10, search, status } = req.query;
    const userId = req.user.id;

    const notebook = await Notebook.findOne({ _id: notebookId, userId });
    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: 'Notebook not found',
      });
    }

    const queryFilter = { notebookId, userId };
    if (status) {
      queryFilter.status = status;
    }
    if (search && typeof search === 'string' && search.trim()) {
      queryFilter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { originalQuestion: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      ResearchSession.find(queryFilter)
        .select('title originalQuestion status researchIntent createdAt updatedAt metadata citations evidence')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ResearchSession.countDocuments(queryFilter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        sessions: sessions.map((s) => ({
          ...s,
          evidenceCount: s.evidence?.length || 0,
          citationCount: s.citations?.length || 0,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve research sessions',
    });
  }
};

/**
 * Get a specific research session by ID
 * GET /api/notebooks/:notebookId/research-sessions/:id
 */
exports.getResearchSessionById = async (req, res) => {
  try {
    const { notebookId, id } = req.params;
    const userId = req.user.id;

    const session = await ResearchSession.findOne({ _id: id, notebookId, userId }).lean();
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Research session not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve research session',
    });
  }
};

/**
 * Delete a research session
 * DELETE /api/notebooks/:notebookId/research-sessions/:id
 */
exports.deleteResearchSession = async (req, res) => {
  try {
    const { notebookId, id } = req.params;
    const userId = req.user.id;

    const session = await ResearchSession.findOneAndDelete({ _id: id, notebookId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Research session not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Research session deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete research session',
    });
  }
};

/**
 * Export research report as Markdown or Plain Text
 * POST /api/notebooks/:notebookId/research-sessions/:id/export
 */
exports.exportResearchSession = async (req, res) => {
  try {
    const { notebookId, id } = req.params;
    const { format = 'markdown' } = req.body;
    const userId = req.user.id;

    const session = await ResearchSession.findOne({ _id: id, notebookId, userId }).lean();
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Research session not found',
      });
    }

    const markdownContent = session.finalAnswer || '';
    let exportContent = markdownContent;

    if (format === 'text' || format === 'txt') {
      // Strip markdown syntax for plain text export
      exportContent = markdownContent
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }

    return res.status(200).json({
      success: true,
      data: {
        filename: `research-${session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format === 'text' ? 'txt' : 'md'}`,
        format,
        content: exportContent,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to export research report',
    });
  }
};
