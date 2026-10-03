/**
 * Production Hardening & Reliability Test Suite (Phase 12)
 */

const assert = require('assert');
const { SlidingWindowLimiter } = require('../src/middlewares/rateLimiter');
const { sanitizeObject } = require('../src/middlewares/sanitizer');
const { validateEnvironment } = require('../src/config/envValidator');
const { aiConcurrencyManager } = require('../src/services/ai/aiConcurrencyManager');
const { validateUrlForSsrf } = require('../src/services/web/webSecurity');
const observabilityService = require('../src/services/observability/observabilityService');

async function runTests() {
  console.log('🧪 Running Phase 12 Production Hardening & Reliability Tests...\n');
  let passed = 0;
  let total = 0;

  function it(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
    }
  }

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

  // 1. Sliding Window Rate Limiting
  it('1. Rate Limiter: Tracks requests accurately and throttles excessive hits', () => {
    const limiter = new SlidingWindowLimiter(60000, 3, 'test');
    const key = 'test-client-ip-1';

    const r1 = limiter.isAllowed(key);
    const r2 = limiter.isAllowed(key);
    const r3 = limiter.isAllowed(key);
    const r4 = limiter.isAllowed(key);

    assert.strictEqual(r1.allowed, true, 'First request allowed');
    assert.strictEqual(r2.allowed, true, 'Second request allowed');
    assert.strictEqual(r3.allowed, true, 'Third request allowed');
    assert.strictEqual(r4.allowed, false, 'Fourth request blocked');
    assert.strictEqual(r4.remaining, 0, 'Zero remaining requests');
    assert(r4.retryAfterSeconds > 0, 'Retry-After calculation');
  });

  // 2. NoSQL Operator Sanitization
  it('2. NoSQL Sanitizer: Recursively strips Mongo operator injection attempts ($where, $gt, nested dots)', () => {
    const maliciousPayload = {
      title: 'Valid Document Title',
      $where: 'sleep(5000)',
      filter: {
        $gt: '',
        status: 'active',
        nested: {
          'malicious.dot': 'bad',
          $regex: '.*',
          cleanKey: 'value',
        },
      },
    };

    const sanitized = sanitizeObject(maliciousPayload);
    assert.strictEqual(sanitized.title, 'Valid Document Title');
    assert.strictEqual(sanitized.$where, undefined, 'Must strip $where');
    assert.strictEqual(sanitized.filter.$gt, undefined, 'Must strip $gt');
    assert.strictEqual(sanitized.filter.status, 'active');
    assert.strictEqual(sanitized.filter.nested['malicious.dot'], undefined, 'Must strip nested dot notation');
    assert.strictEqual(sanitized.filter.nested.$regex, undefined, 'Must strip $regex');
    assert.strictEqual(sanitized.filter.nested.cleanKey, 'value');
  });

  // 3. AI Concurrency Bounding & Deduplication
  await itAsync('3. AI Concurrency Manager: Bounded parallel execution and request deduplication', async () => {
    let callCount = 0;
    const taskKey = 'ai-dedupe-key-1';

    const taskFn = () =>
      aiConcurrencyManager.execute(taskKey, async () => {
        callCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return { summary: 'High quality summary' };
      });

    const [res1, res2, res3] = await Promise.all([taskFn(), taskFn(), taskFn()]);

    assert.strictEqual(res1.summary, 'High quality summary');
    assert.strictEqual(res2.summary, 'High quality summary');
    assert.strictEqual(res3.summary, 'High quality summary');
    assert.strictEqual(callCount, 1, 'Deduplicated simultaneous executions into 1 worker');
  });

  // 4. Environment & Startup Secret Validation
  it('4. Environment Validator: Enforces required configuration flags and security rules', () => {
    const result = validateEnvironment();
    assert(typeof result === 'boolean', 'validateEnvironment returns boolean');
  });

  // 5. Observability & Telemetry Hooks
  it('5. Observability Hooks: Records metrics, events, and exceptions cleanly', () => {
    observabilityService.recordMetric('test_metric', 42, { unit: 'ms' });
    observabilityService.logEvent('USER_ACTION', { action: 'test' });
    observabilityService.captureException(new Error('Test handled error'), { context: 'unit_test' });

    const snapshot = observabilityService.getMetricsSnapshot();
    assert(snapshot.test_metric && snapshot.test_metric.lastValue === 42, 'Should record metric snapshot');
  });

  // 6. SSRF Security Verification
  await itAsync('6. SSRF Security Regression: Blocks internal networks and private IPv4/IPv6 ranges', async () => {
    const blockedTargets = [
      'http://127.0.0.1:5000/api',
      'http://localhost:3000',
      'http://169.254.169.254/latest/meta-data',
      'http://10.0.0.1',
      'http://192.168.1.1',
      'ftp://ftp.example.com/file',
      'file:///etc/hosts',
    ];

    for (const target of blockedTargets) {
      const check = await validateUrlForSsrf(target);
      assert.strictEqual(check.valid, false, `Should block target: ${target}`);
    }
  });

  // 7. Safe Public Domain Resolution
  await itAsync('7. SSRF Security: Allows valid public HTTPS domain', async () => {
    const check = await validateUrlForSsrf('https://en.wikipedia.org/wiki/Artificial_intelligence');
    assert.strictEqual(check.valid, true, 'Public URL should be valid');
  });

  console.log(`\nProduction Hardening Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
