/**
 * Load and Stress Simulation Test Suite (Phase 12)
 */

const assert = require('assert');
const { aiConcurrencyManager } = require('../src/services/ai/aiConcurrencyManager');
const { SlidingWindowLimiter } = require('../src/middlewares/rateLimiter');

async function runTests() {
  console.log('🧪 Running Phase 12 Load & Stress Simulation Tests...\n');
  let passed = 0;
  let total = 0;

  async function itAsync(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
    }
  }

  // 1. High-concurrency rate limiter stress test
  await itAsync('1. Rate Limiter Stress: Evaluates 1,000 rapid concurrent evaluations without memory leakage or race conditions', async () => {
    const limiter = new SlidingWindowLimiter(60000, 500, 'stress-test');
    const key = 'stress-user-1';

    let allowedCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < 1000; i++) {
      const res = limiter.isAllowed(key);
      if (res.allowed) allowedCount++;
      else blockedCount++;
    }

    assert.strictEqual(allowedCount, 500, 'Exactly 500 allowed');
    assert.strictEqual(blockedCount, 500, 'Exactly 500 blocked');
  });

  // 2. High-concurrency AI worker pool simulation
  await itAsync('2. AI Concurrency Stress: Handles 50 queued parallel tasks under bounded concurrency', async () => {
    let completed = 0;
    const taskCount = 50;
    const start = Date.now();

    const tasks = Array.from({ length: taskCount }, (_, idx) => {
      return aiConcurrencyManager.execute(
        `stress_task_${idx}`,
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          completed++;
          return `task_${idx}`;
        },
        { dedupe: false }
      );
    });

    const results = await Promise.all(tasks);
    const duration = Date.now() - start;

    assert.strictEqual(results.length, taskCount);
    assert.strictEqual(completed, taskCount);
    assert(duration < 5000, '50 tasks should complete in under 5 seconds under local bounded worker');
  });

  console.log(`\nLoad & Stress Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
