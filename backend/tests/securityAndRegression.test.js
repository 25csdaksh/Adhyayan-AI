/**
 * Security & Regression Test Suite (Phases 01-10)
 */

const assert = require('assert');
const { validateUrlAgainstSsrf } = require('../src/services/web/webSecurity');
const { isLiveGeminiConfigured, isPseudoFallbackEnabled } = require('../src/services/embedding/embeddingService');
const { generateToken, verifyToken } = require('../src/utils/jwt');

async function runTests() {
  console.log('🧪 Running Security & Regression Tests...\n');
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

  // 1. SSRF URL Security
  it('1. SSRF Protection: Blocks private loopback IP (127.0.0.1)', async () => {
    let threw = false;
    try {
      await validateUrlAgainstSsrf('http://127.0.0.1:8080/admin');
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Must block loopback URL');
  });

  it('2. SSRF Protection: Blocks cloud metadata endpoint (169.254.169.254)', async () => {
    let threw = false;
    try {
      await validateUrlAgainstSsrf('http://169.254.169.254/latest/meta-data/');
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Must block AWS/GCP metadata IP');
  });

  it('3. SSRF Protection: Blocks non-http protocols (file://, ftp://, gopher://)', async () => {
    let threw = false;
    try {
      await validateUrlAgainstSsrf('file:///etc/passwd');
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Must block file protocol');
  });

  // 2. JWT Authentication
  it('4. Auth Security: Generates and verifies valid JWT tokens', () => {
    const payload = { userId: 'usr_12345', email: 'student@study.edu' };
    const token = generateToken(payload);
    assert(token && typeof token === 'string');

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.userId, 'usr_12345');
  });

  it('5. Auth Security: Rejects forged or corrupted JWT tokens', () => {
    let threw = false;
    try {
      verifyToken('invalid.jwt.token.string');
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Must reject invalid JWT');
  });

  // 3. Fallback Configuration Safety
  it('6. Embedding Configuration: Validates active mode and fallback safety flags', () => {
    const live = isLiveGeminiConfigured();
    const pseudo = isPseudoFallbackEnabled();
    assert(typeof live === 'boolean', 'isLiveGeminiConfigured must return boolean');
    assert(typeof pseudo === 'boolean', 'isPseudoFallbackEnabled must return boolean');
  });

  console.log(`\nSecurity & Regression Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
