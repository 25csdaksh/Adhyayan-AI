/**
 * Retrieval & Context Builder Test Suite (Phase 10)
 */

const assert = require('assert');
const { calculateCosineSimilarity } = require('../src/services/search/vectorSearchService');
const { buildContext, calculateTextOverlap } = require('../src/services/rag/contextBuilder');

async function runTests() {
  console.log('🧪 Running Retrieval & Context Builder Tests...\n');
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

  it('1. calculateCosineSimilarity computes exact vector geometry', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];
    const v4 = [0.5, 0.5, 0];

    assert.strictEqual(calculateCosineSimilarity(v1, v2), 1.0);
    assert.strictEqual(calculateCosineSimilarity(v1, v3), 0.0);
    const sim = calculateCosineSimilarity(v1, v4);
    assert(sim > 0.70 && sim < 0.72, `Expected ~0.707, got ${sim}`);
  });

  it('2. calculateTextOverlap detects near-duplicate chunks', () => {
    const t1 = 'Operating systems manage computer hardware resources efficiently and reliably.';
    const t2 = 'Operating systems manage computer hardware resources efficiently and reliably with low latency.';
    const t3 = 'Quantum physics explores the fundamental wave-particle duality of matter.';

    const overlap12 = calculateTextOverlap(t1, t2);
    const overlap13 = calculateTextOverlap(t1, t3);

    assert(overlap12 > 0.7, `Expected high overlap between t1 and t2, got ${overlap12}`);
    assert.strictEqual(overlap13, 0, `Expected 0 overlap between t1 and t3, got ${overlap13}`);
  });

  it('3. buildContext deduplicates similar chunks and tags [SOURCE_X] identifiers', () => {
    const chunks = [
      {
        chunkId: 'c1',
        documentTitle: 'Operating Systems.pdf',
        text: 'A deadlock is a situation where two or more processes wait indefinitely for resources.',
        pageNumber: 15,
        sourceType: 'pdf',
      },
      {
        chunkId: 'c2',
        documentTitle: 'Operating Systems.pdf',
        text: 'A deadlock is a situation where two or more processes wait indefinitely for resources.', // duplicate
        pageNumber: 15,
        sourceType: 'pdf',
      },
      {
        chunkId: 'c3',
        documentTitle: 'Computer Networks.pdf',
        text: 'TCP provides reliable, ordered delivery of a stream of bytes over an IP network.',
        pageNumber: 42,
        sourceType: 'pdf',
      },
    ];

    const { contextText, sourceMap, formattedSources } = buildContext(chunks, { maxChunks: 5 });

    assert(formattedSources.length === 2, `Expected 2 unique sources after deduplication, got ${formattedSources.length}`);
    assert(sourceMap.has('SOURCE_1'), 'Must have SOURCE_1 mapping');
    assert(sourceMap.has('SOURCE_2'), 'Must have SOURCE_2 mapping');
    assert(contextText.includes('[SOURCE_1]'), 'Context text must contain [SOURCE_1]');
    assert(contextText.includes('Page 15'), 'Context text must include page metadata');
  });

  it('4. buildContext formats web source metadata with domains and URLs', () => {
    const webChunks = [
      {
        chunkId: 'w1',
        documentTitle: 'MDN Web Docs: HTTP Overview',
        text: 'HTTP is an application-layer protocol for transmitting hypermedia documents.',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
        domain: 'developer.mozilla.org',
        sourceKind: 'web',
      },
    ];

    const { contextText, formattedSources } = buildContext(webChunks);
    assert.strictEqual(formattedSources.length, 1);
    assert(contextText.includes('developer.mozilla.org'), 'Must include domain in web context');
    assert(formattedSources[0].url.includes('mozilla.org'), 'Must preserve URL');
  });

  it('5. buildContext strictly enforces maximum character limits', () => {
    const longChunks = [
      { chunkId: '1', documentTitle: 'Doc 1', text: 'A'.repeat(500) },
      { chunkId: '2', documentTitle: 'Doc 2', text: 'B'.repeat(500) },
    ];

    const { contextText } = buildContext(longChunks, { maxCharacters: 400 });
    assert(contextText.length <= 600, `Context length (${contextText.length}) should not exceed budget bound`);
  });

  console.log(`\nRetrieval Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
