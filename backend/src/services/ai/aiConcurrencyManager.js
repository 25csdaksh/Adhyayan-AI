const crypto = require('crypto');
const { logger } = require('../../utils/logger');
const observabilityService = require('../observability/observabilityService');

/**
 * AI Request Concurrency Limiter and In-Flight Deduplicator
 * Protects Google Gemini API quota from spike exhaustion and parallel storm requests
 */
class AiConcurrencyManager {
  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    this.activeCount = 0;
    this.queue = [];
    this.inFlightRequests = new Map();
  }

  /**
   * Acquire a slot or wait in line
   */
  async acquire() {
    if (this.activeCount < this.maxConcurrency) {
      this.activeCount++;
      return;
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  /**
   * Release an active slot and process next waiting request
   */
  release() {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.queue.length > 0) {
      this.activeCount++;
      const nextResolve = this.queue.shift();
      nextResolve();
    }
  }

  /**
   * Generate deterministic cache key for in-flight deduplication
   */
  computeHash(prompt, options = {}) {
    const raw = `${typeof prompt === 'string' ? prompt : JSON.stringify(prompt)}_${JSON.stringify(options)}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Execute an AI operation through concurrency throttle and deduplication
   * @param {string|Object} promptIdentifier
   * @param {Function} taskFn - () => Promise<any>
   * @param {Object} [options={}]
   */
  async execute(promptIdentifier, taskFn, options = {}) {
    const dedupeKey = options.dedupe === false ? null : this.computeHash(promptIdentifier, options);

    // If identical request is currently in flight, attach to existing promise
    if (dedupeKey && this.inFlightRequests.has(dedupeKey)) {
      logger.debug(`[AI Concurrency] In-flight deduplication hit for key ${dedupeKey.slice(0, 12)}`);
      observabilityService.recordMetric('ai.deduped_requests', 1);
      return await this.inFlightRequests.get(dedupeKey);
    }

    const executionPromise = (async () => {
      await this.acquire();
      observabilityService.recordMetric('ai.concurrent_active', this.activeCount);
      try {
        const result = await taskFn();
        return result;
      } finally {
        this.release();
        if (dedupeKey) {
          this.inFlightRequests.delete(dedupeKey);
        }
      }
    })();

    if (dedupeKey) {
      this.inFlightRequests.set(dedupeKey, executionPromise);
    }

    return await executionPromise;
  }

}

const aiConcurrencyManager = new AiConcurrencyManager(
  parseInt(process.env.MAX_CONCURRENT_AI_REQUESTS || '6', 10)
);

module.exports = {
  AiConcurrencyManager,
  aiConcurrencyManager,
};
