const { logger } = require('../../utils/logger');

/**
 * Pluggable Observability & Telemetry Service
 * Prepares the architecture to integrate with Sentry, OpenTelemetry, Datadog, etc.
 */

const metricsStore = new Map();

const observabilityService = {
  /**
   * Capture and record an exception with context
   * @param {Error} error
   * @param {Object} [context={}]
   */
  captureException: (error, context = {}) => {
    logger.error(`[Observability] Exception captured: ${error?.message || error}`, {
      error,
      context,
    });
    // Hook point for external providers (e.g. Sentry.captureException(error))
  },

  /**
   * Record a custom application metric
   * @param {string} metricName
   * @param {number} value
   * @param {Object} [tags={}]
   */
  recordMetric: (metricName, value = 1, tags = {}) => {
    const current = metricsStore.get(metricName) || { count: 0, total: 0, lastValue: 0, lastUpdated: null };
    current.count += 1;
    current.total += value;
    current.lastValue = value;
    current.lastUpdated = new Date().toISOString();
    metricsStore.set(metricName, current);

    logger.debug(`[Metric] ${metricName}: ${value}`, { tags });
  },

  /**
   * Log an operational lifecycle event
   * @param {string} eventName
   * @param {Object} [payload={}]
   */
  logEvent: (eventName, payload = {}) => {
    logger.info(`[Event] ${eventName}`, payload);
  },

  /**
   * Retrieve internal recorded metrics snapshot
   */
  getMetricsSnapshot: () => {
    const result = {};
    for (const [key, val] of metricsStore.entries()) {
      result[key] = { ...val };
    }
    return result;
  },

  /**
   * Reset internal metrics store (useful for tests)
   */
  resetMetrics: () => {
    metricsStore.clear();
  },
};

module.exports = observabilityService;
