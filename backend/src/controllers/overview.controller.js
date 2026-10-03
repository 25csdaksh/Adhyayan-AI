const Document = require('../models/Document');
const WebSource = require('../models/WebSource');
const Chunk = require('../models/Chunk');
const SavedInsight = require('../models/SavedInsight');
const StudyToolResult = require('../models/StudyToolResult');
const SourceRelationship = require('../models/SourceRelationship');
const { extractKeyTopics, extractDefinitions } = require('../services/sourceIntelligence/sourceMetadataService');
const { generateNotebookRecommendations } = require('../services/recommendation/recommendationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc Get comprehensive knowledge overview for a notebook
 * @route GET /api/notebooks/:notebookId/overview
 * @access Private
 */
const getOverview = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const userId = req.user._id;

  const [documents, webSources, chunkCount, insightsCount, studyTools, relationships] = await Promise.all([
    Document.find({ notebookId, ownerId: userId }).lean(),
    WebSource.find({ notebookId, ownerId: userId }).lean(),
    Chunk.countDocuments({ notebookId }),
    SavedInsight.countDocuments({ notebookId, userId }),
    StudyToolResult.find({ notebookId, userId }).lean(),
    SourceRelationship.find({ notebookId, userId }).lean(),
  ]);

  const allSources = [...documents, ...webSources];
  const processedCount = allSources.filter((s) => s.status === 'ready').length;
  const failedCount = allSources.filter((s) => s.status === 'failed').length;
  const processingCount = allSources.filter((s) => s.status === 'processing' || s.status === 'pending').length;

  const combinedText = [
    ...documents.map((d) => d.rawText || d.title || ''),
    ...webSources.map((w) => w.extractedText || w.title || ''),
  ].join('\n');

  const topics = extractKeyTopics(combinedText).slice(0, 10);
  const definitions = extractDefinitions(combinedText).slice(0, 8);

  const stats = {
    totalSources: allSources.length,
    processedSources: processedCount,
    failedSources: failedCount,
    processingSources: processingCount,
    totalChunks: chunkCount,
    savedInsightsCount: insightsCount,
    studyToolsCount: studyTools.length,
    relationshipsCount: relationships.length,
    sourceTypeBreakdown: {
      pdf: documents.filter((d) => d.sourceType === 'pdf').length,
      docx: documents.filter((d) => d.sourceType === 'docx').length,
      txt: documents.filter((d) => d.sourceType === 'txt').length,
      text: documents.filter((d) => d.sourceType === 'text').length,
      web: webSources.length,
    },
  };

  return ApiResponse.success(
    res,
    {
      stats,
      topics,
      definitions,
      recentStudyTools: studyTools.slice(-4),
      recentRelationships: relationships.slice(0, 5),
    },
    'Notebook overview generated',
    200
  );
});

/**
 * @desc Get personalized study recommendations for a notebook
 * @route GET /api/notebooks/:notebookId/recommendations
 * @access Private
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { notebookId } = req.params;
  const recommendations = await generateNotebookRecommendations({
    notebookId,
    userId: req.user._id,
  });

  return ApiResponse.success(res, { recommendations }, 'Recommendations generated', 200);
});

module.exports = {
  getOverview,
  getRecommendations,
};
