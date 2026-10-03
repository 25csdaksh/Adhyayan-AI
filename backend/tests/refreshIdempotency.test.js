/**
 * Web Refresh & Idempotency Test Suite (Phase 11)
 */

const assert = require('assert');
const { computeContentHash, canonicalizeUrl, extractDomain } = require('../src/services/web/urlCanonicalizer');

async function runTests() {
  console.log('🧪 Running Web Refresh & Idempotency Tests (Phase 11)...\n');
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

  it('1. canonicalizeUrl normalizes trailing slashes and tracking parameters', () => {
    const u1 = 'https://example.com/docs/?utm_source=twitter&utm_medium=social#overview';
    const u2 = 'https://example.com/docs';

    const c1 = canonicalizeUrl(u1);
    const c2 = canonicalizeUrl(u2);

    assert(!c1.includes('utm_source'), 'Should strip tracking query parameters');
    assert(!c1.includes('#overview'), 'Should strip fragment identifiers');
    assert.strictEqual(c1, 'https://example.com/docs');
    assert.strictEqual(c2, 'https://example.com/docs');
  });

  it('2. computeContentHash produces deterministic 64-character SHA-256 hashes', () => {
    const text = 'TCP is a reliable transport layer protocol that provides flow control.';
    const hash1 = computeContentHash(text);
    const hash2 = computeContentHash(text);

    assert(hash1 && typeof hash1 === 'string', 'Hash should be string');
    assert.strictEqual(hash1.length, 64, 'SHA-256 must be 64 hexadecimal characters');
    assert.strictEqual(hash1, hash2, 'Identical text must produce identical content hash');
  });

  it('3. computeContentHash changes when text content is modified', () => {
    const textOriginal = 'Version 1.0 of the specification.';
    const textUpdated = 'Version 2.0 of the specification with additional security protocols.';

    const hash1 = computeContentHash(textOriginal);
    const hash2 = computeContentHash(textUpdated);

    assert.notStrictEqual(hash1, hash2, 'Different text must produce different content hashes');
  });

  it('4. extractDomain parses hostnames and strips port numbers', () => {
    assert.strictEqual(extractDomain('https://en.wikipedia.org/wiki/OSI_model'), 'en.wikipedia.org');
    assert.strictEqual(extractDomain('http://api.example.com:8080/v1/resource'), 'api.example.com');
  });

  console.log(`\nWeb Refresh & Idempotency Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
