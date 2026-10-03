const SourceRelationship = require('../../models/SourceRelationship');
const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const { extractKeyTopics } = require('../sourceIntelligence/sourceMetadataService');
const { logActivity } = require('../activity/activityService');

/**
 * Calculate Jaccard similarity between two topic sets
 */
function calculateTopicOverlap(setA, setB) {
  if (!setA.size || !setB.size) return { overlap: 0, shared: [] };

  const shared = [];
  for (const item of setA) {
    if (setB.has(item)) {
      shared.push(item);
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  const overlap = shared.length / unionSize;

  return { overlap, shared };
}

/**
 * Detect relationships between all sources in a notebook
 */
async function detectNotebookSourceRelationships({ notebookId, userId }) {
  // 1. Fetch all processed documents and web sources
  const [documents, webSources] = await Promise.all([
    Document.find({ notebookId, ownerId: userId, status: 'ready' }).lean(),
    WebSource.find({ notebookId, ownerId: userId, status: 'ready' }).lean(),
  ]);

  const allSources = [
    ...documents.map((d) => ({
      id: d._id,
      type: d.sourceType || 'pdf',
      title: d.title || d.originalFileName || 'Untitled Document',
      text: d.rawText || '',
      topics: new Set(extractKeyTopics(d.rawText || `${d.title} ${(d.metadata?.topics || []).join(' ')}`).map((t) => t.toLowerCase())),
    })),
    ...webSources.map((w) => ({
      id: w._id,
      type: 'web',
      title: w.title || w.domain || 'Web Source',
      text: w.extractedText || '',
      topics: new Set(extractKeyTopics(w.extractedText || `${w.title} ${w.description || ''}`).map((t) => t.toLowerCase())),
    })),
  ];

  if (allSources.length < 2) {
    return [];
  }

  const relationshipsToSave = [];

  // 2. Compare pairwise sources
  for (let i = 0; i < allSources.length; i++) {
    for (let j = i + 1; j < allSources.length; j++) {
      const sA = allSources[i];
      const sB = allSources[j];

      const { overlap, shared } = calculateTopicOverlap(sA.topics, sB.topics);

      let relType = null;
      let explanation = '';
      let confidence = 0.5;

      if (overlap >= 0.35 || shared.length >= 3) {
        relType = 'overlapping';
        explanation = `Both sources cover heavily overlapping subject matter including ${shared.slice(0, 3).join(', ')}.`;
        confidence = Math.min(0.95, 0.6 + overlap * 0.5);
      } else if (shared.length >= 1 || overlap >= 0.15) {
        relType = 'related';
        explanation = `These sources share foundational concepts regarding ${shared.join(', ')}.`;
        confidence = Math.min(0.85, 0.5 + overlap * 0.4);
      } else if (
        (sA.title.toLowerCase().includes('advanced') || sA.title.toLowerCase().includes('part 2')) &&
        (sB.title.toLowerCase().includes('intro') || sB.title.toLowerCase().includes('part 1') || sB.title.toLowerCase().includes('basic'))
      ) {
        relType = 'dependent';
        explanation = `'${sA.title}' builds upon foundational concepts presented in '${sB.title}'.`;
        confidence = 0.85;
      }

      if (relType) {
        relationshipsToSave.push({
          notebookId,
          userId,
          sourceA: {
            sourceId: sA.id,
            sourceType: sA.type,
            title: sA.title,
          },
          sourceB: {
            sourceId: sB.id,
            sourceType: sB.type,
            title: sB.title,
          },
          relationshipType: relType,
          explanation,
          confidence,
          sharedTopics: shared,
        });
      }
    }
  }

  // 3. Clear existing relationships for this notebook and insert refreshed ones
  await SourceRelationship.deleteMany({ notebookId, userId });

  let saved = [];
  if (relationshipsToSave.length > 0) {
    saved = await SourceRelationship.insertMany(relationshipsToSave);
    logActivity({
      notebookId,
      userId,
      action: 'relationship_detected',
      title: 'Detected Source Relationships',
      details: `Identified ${saved.length} topical relationships across notebook materials.`,
    });
  }

  return saved;
}

/**
 * Get all existing source relationships for a notebook
 */
async function getNotebookSourceRelationships({ notebookId, userId }) {
  return SourceRelationship.find({ notebookId, userId }).sort({ confidence: -1 }).lean();
}

module.exports = {
  detectNotebookSourceRelationships,
  getNotebookSourceRelationships,
};
