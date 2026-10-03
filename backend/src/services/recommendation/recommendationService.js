const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const StudyToolResult = require('../../models/StudyToolResult');
const SourceRelationship = require('../../models/SourceRelationship');
const { extractKeyTopics } = require('../sourceIntelligence/sourceMetadataService');

/**
 * Generate grounded, actionable study recommendations for a notebook
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} params.notebookId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 */
async function generateNotebookRecommendations({ notebookId, userId }) {
  const [documents, webSources, studyTools, relationships] = await Promise.all([
    Document.find({ notebookId, ownerId: userId }).lean(),
    WebSource.find({ notebookId, ownerId: userId }).lean(),
    StudyToolResult.find({ notebookId, userId }).lean(),
    SourceRelationship.find({ notebookId, userId }).lean(),
  ]);

  const totalSources = documents.length + webSources.length;
  if (totalSources === 0) {
    return [
      {
        id: 'rec-add-first-source',
        type: 'action',
        title: 'Add your first research source',
        description: 'Upload a PDF, DOCX, TXT file or paste a web URL to unlock grounded AI study tools and source intelligence.',
        actionType: 'add_source',
        priority: 'high',
      },
    ];
  }

  const recommendations = [];

  // Extract major topics from all ready documents
  const allTexts = [
    ...documents.map((d) => d.rawText || d.title || ''),
    ...webSources.map((w) => w.extractedText || w.title || ''),
  ].join('\n');

  const topics = extractKeyTopics(allTexts).slice(0, 5);
  const existingTools = new Set(studyTools.map((t) => t.toolType));

  // 1. Recommend Flashcards if not generated
  if (!existingTools.has('flashcards') && topics.length > 0) {
    recommendations.push({
      id: 'rec-flashcards',
      type: 'study_tool',
      title: `Practice Flashcards for ${topics[0]}`,
      description: `Test active recall on foundational concepts extracted from your notebook materials.`,
      actionType: 'generate_tool',
      toolType: 'flashcards',
      topic: topics[0],
      priority: 'high',
    });
  }

  // 2. Recommend Quiz if not generated
  if (!existingTools.has('quiz') && topics.length > 0) {
    const topic = topics[1] || topics[0];
    recommendations.push({
      id: 'rec-quiz',
      type: 'study_tool',
      title: `Take a Quiz on ${topic}`,
      description: `Validate your comprehension with source-grounded multiple choice questions.`,
      actionType: 'generate_tool',
      toolType: 'quiz',
      topic,
      priority: 'medium',
    });
  }

  // 3. Recommend Mind Map if not generated
  if (!existingTools.has('mindmap')) {
    recommendations.push({
      id: 'rec-mindmap',
      type: 'study_tool',
      title: 'Synthesize Knowledge Mind Map',
      description: 'Generate a hierarchical taxonomy tree visualizing the core concepts across all your sources.',
      actionType: 'generate_tool',
      toolType: 'mindmap',
      priority: 'medium',
    });
  }

  // 4. Recommend exploring relationships if detected
  if (relationships.length > 0) {
    const topRel = relationships[0];
    recommendations.push({
      id: `rec-rel-${topRel._id}`,
      type: 'relationship',
      title: `Compare '${topRel.sourceA.title}' & '${topRel.sourceB.title}'`,
      description: topRel.explanation,
      actionType: 'compare_sources',
      sourceA: topRel.sourceA,
      sourceB: topRel.sourceB,
      priority: 'medium',
    });
  }

  // 5. Deep-dive on remaining key topics
  if (topics.length >= 3) {
    recommendations.push({
      id: `rec-explore-${topics[2]}`,
      type: 'explore',
      title: `Deep dive into ${topics[2]}`,
      description: `Ask targeted questions in chat to explore how ${topics[2]} connects to other source themes.`,
      actionType: 'ask_question',
      suggestedQuery: `Explain how ${topics[2]} works based on our uploaded sources.`,
      priority: 'low',
    });
  }

  return recommendations;
}

module.exports = {
  generateNotebookRecommendations,
};
