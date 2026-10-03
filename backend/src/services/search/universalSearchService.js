const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const ChatMessage = require('../../models/ChatMessage');
const ChatSession = require('../../models/ChatSession');
const SavedInsight = require('../../models/SavedInsight');
const StudyToolResult = require('../../models/StudyToolResult');

/**
 * Universal Search across all notebook entity categories
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {string} params.query
 * @param {'all'|'sources'|'chats'|'insights'|'study_tools'} [params.category='all']
 * @param {number} [params.limit=15]
 */
async function performUniversalSearch({ notebookId, userId, query, category = 'all', limit = 15 }) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      query: '',
      category,
      results: {
        sources: [],
        chats: [],
        insights: [],
        studyTools: [],
      },
      totalCount: 0,
    };
  }

  const cleanQuery = query.trim();
  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const results = {
    sources: [],
    chats: [],
    insights: [],
    studyTools: [],
  };

  const tasks = [];

  // 1. Search Sources
  if (category === 'all' || category === 'sources') {
    tasks.push(
      (async () => {
        const [docs, webs] = await Promise.all([
          Document.find({
            notebookId,
            ownerId: userId,
            $or: [{ title: regex }, { originalFileName: regex }, { rawText: regex }],
          })
            .limit(limit)
            .lean(),
          WebSource.find({
            notebookId,
            ownerId: userId,
            $or: [{ title: regex }, { domain: regex }, { description: regex }, { extractedText: regex }],
          })
            .limit(limit)
            .lean(),
        ]);

        results.sources = [
          ...docs.map((d) => ({
            id: d._id,
            sourceType: d.sourceType || 'document',
            title: d.title || d.originalFileName,
            snippet: (d.rawText || '').slice(0, 200),
            createdAt: d.createdAt,
          })),
          ...webs.map((w) => ({
            id: w._id,
            sourceType: 'web',
            title: w.title || w.domain,
            url: w.url,
            snippet: (w.extractedText || w.description || '').slice(0, 200),
            createdAt: w.createdAt,
          })),
        ].slice(0, limit);
      })()
    );
  }

  // 2. Search Chat History
  if (category === 'all' || category === 'chats') {
    tasks.push(
      (async () => {
        const messages = await ChatMessage.find({
          notebookId,
          userId,
          content: regex,
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        results.chats = messages.map((m) => ({
          id: m._id,
          sessionId: m.sessionId,
          role: m.role,
          content: m.content.slice(0, 240),
          citationCount: (m.citations || []).length,
          createdAt: m.createdAt,
        }));
      })()
    );
  }

  // 3. Search Saved Insights
  if (category === 'all' || category === 'insights') {
    tasks.push(
      (async () => {
        const insights = await SavedInsight.find({
          notebookId,
          userId,
          $or: [{ title: regex }, { content: regex }, { tags: regex }],
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        results.insights = insights.map((i) => ({
          id: i._id,
          title: i.title,
          content: i.content.slice(0, 240),
          tags: i.tags,
          pinned: i.pinned,
          createdAt: i.createdAt,
        }));
      })()
    );
  }

  // 4. Search Study Tools
  if (category === 'all' || category === 'study_tools') {
    tasks.push(
      (async () => {
        const tools = await StudyToolResult.find({
          notebookId,
          userId,
          $or: [{ title: regex }, { toolType: regex }],
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        results.studyTools = tools.map((t) => ({
          id: t._id,
          toolType: t.toolType,
          title: t.title,
          citationCount: (t.citations || []).length,
          createdAt: t.createdAt,
        }));
      })()
    );
  }

  await Promise.all(tasks);

  const totalCount =
    results.sources.length + results.chats.length + results.insights.length + results.studyTools.length;

  return {
    query: cleanQuery,
    category,
    results,
    totalCount,
  };
}

module.exports = {
  performUniversalSearch,
};
