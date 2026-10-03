const Document = require('../../models/Document');
const WebSource = require('../../models/WebSource');
const { logger } = require('../../utils/logger');
const observabilityService = require('../observability/observabilityService');

/**
 * Stale Job Detection and Recovery Service
 * Recovers documents stuck in 'processing' state due to server restart or network timeout
 */
const DEFAULT_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

async function recoverStaleProcessingJobs(thresholdMs = DEFAULT_STALE_THRESHOLD_MS) {
  const staleDate = new Date(Date.now() - thresholdMs);
  let recoveredCount = 0;

  try {
    // 1. Recover stale Documents
    const staleDocs = await Document.find({
      status: 'processing',
      updatedAt: { $lt: staleDate },
    });

    for (const doc of staleDocs) {
      doc.status = 'failed';
      doc.processingError = 'Processing timed out after an extended period. Please retry.';
      await doc.save();
      recoveredCount++;

      logger.warn(`[Stale Job Recovery] Recovered stuck document ${doc._id} (${doc.title})`);
      observabilityService.recordMetric('document.stale_recovered', 1);
    }

    // 2. Recover stale WebSources
    const staleWebSources = await WebSource.find({
      status: 'processing',
      updatedAt: { $lt: staleDate },
    });

    for (const webSource of staleWebSources) {
      webSource.status = 'failed';
      webSource.errorMessage = 'Web extraction timed out. Please refresh this source.';
      await webSource.save();
      recoveredCount++;

      logger.warn(`[Stale Job Recovery] Recovered stuck web source ${webSource._id} (${webSource.url})`);
      observabilityService.recordMetric('web_source.stale_recovered', 1);
    }
  } catch (err) {
    logger.error('[Stale Job Recovery] Error checking stale jobs:', { error: err });
    observabilityService.captureException(err, { service: 'staleJobRecoveryService' });
  }

  return recoveredCount;
}

/**
 * Start periodic background recovery of stale jobs
 * @param {number} intervalMs - Interval in milliseconds between recovery runs (default: 10 minutes)
 * @returns {NodeJS.Timeout} The interval timer handle
 */
function startStaleJobRecovery(intervalMs = 10 * 60 * 1000) {
  // Execute an initial pass after a brief startup delay (10s)
  setTimeout(() => {
    recoverStaleProcessingJobs().catch((err) => {
      logger.error('[Stale Job Recovery] Error during initial recovery pass:', { error: err });
    });
  }, 10000);

  // Set recurring interval
  return setInterval(() => {
    recoverStaleProcessingJobs().catch((err) => {
      logger.error('[Stale Job Recovery] Error during interval recovery pass:', { error: err });
    });
  }, intervalMs);
}

module.exports = {
  recoverStaleProcessingJobs,
  startStaleJobRecovery,
};
