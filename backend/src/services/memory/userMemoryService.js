const UserMemory = require('../../models/UserMemory');
const ApiError = require('../../utils/apiError');

/**
 * Retrieve user memories with filtering and pagination
 */
async function getUserMemories({ userId, type, active, search, page = 1, limit = 20 }) {
  const query = { userId };

  if (type) {
    query.type = type;
  }

  if (active !== undefined) {
    query.active = active === 'true' || active === true;
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.content = { $regex: escaped, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [memories, total] = await Promise.all([
    UserMemory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserMemory.countDocuments(query),
  ]);

  return {
    memories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Create an explicit user memory
 */
async function createUserMemory({ userId, type, content, tags = [], source = 'explicit_user', metadata = {} }) {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw ApiError.badRequest('Memory content is required.');
  }

  const memory = await UserMemory.create({
    userId,
    type: type || 'preference',
    content: content.trim(),
    tags: Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase()) : [],
    source,
    metadata,
  });

  return memory;
}

/**
 * Update an existing user memory
 */
async function updateUserMemory({ memoryId, userId, updateData }) {
  const memory = await UserMemory.findOne({ _id: memoryId, userId });
  if (!memory) {
    throw ApiError.notFound('Memory not found or access denied.');
  }

  if (updateData.content !== undefined) {
    memory.content = String(updateData.content).trim();
  }
  if (updateData.type !== undefined) {
    memory.type = updateData.type;
  }
  if (updateData.active !== undefined) {
    memory.active = Boolean(updateData.active);
  }
  if (updateData.tags !== undefined && Array.isArray(updateData.tags)) {
    memory.tags = updateData.tags.map((t) => String(t).trim().toLowerCase());
  }

  await memory.save();
  return memory;
}

/**
 * Delete a user memory
 */
async function deleteUserMemory({ memoryId, userId }) {
  const memory = await UserMemory.findOneAndDelete({ _id: memoryId, userId });
  if (!memory) {
    throw ApiError.notFound('Memory not found or access denied.');
  }
  return { deleted: true };
}

/**
 * Retrieve top relevant memories for a user query to inject into RAG context
 * Enforces strict character and item bounds (max 3 items, max 1000 chars total)
 */
async function getRelevantUserMemoriesForQuery({ userId, queryText, maxItems = 3, maxChars = 1000 }) {
  if (!userId) return [];

  // Fetch all active user memories for this user
  const activeMemories = await UserMemory.find({ userId, active: true }).lean();
  if (activeMemories.length === 0) return [];

  const qWords = (queryText || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Score relevance based on keyword and tag overlap
  const scored = activeMemories.map((mem) => {
    let score = 0;
    const memText = `${mem.content} ${mem.tags?.join(' ') || ''}`.toLowerCase();

    // Give base weight to high-priority preference types
    if (mem.type === 'study_preference' || mem.type === 'saved_instruction') {
      score += 1.5;
    }

    // Match query keywords
    for (const w of qWords) {
      if (memText.includes(w)) {
        score += 2;
      }
    }

    return { memory: mem, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const selected = [];
  let charCount = 0;

  for (const item of scored) {
    if (selected.length >= maxItems) break;
    const textLen = item.memory.content.length;
    if (charCount + textLen > maxChars) continue;

    selected.push(item.memory);
    charCount += textLen;
  }

  return selected;
}

module.exports = {
  getUserMemories,
  createUserMemory,
  updateUserMemory,
  deleteUserMemory,
  getRelevantUserMemoriesForQuery,
};
