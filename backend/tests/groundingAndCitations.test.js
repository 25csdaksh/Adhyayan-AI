/**
 * Grounding & Citations Test Suite (Phase 10)
 */

const assert = require('assert');
const { processCitations } = require('../src/services/rag/citationService');
const { generateGroundedResponse, INSUFFICIENT_INFO_RESPONSE } = require('../src/services/rag/ragService');

async function runTests() {
  console.log('🧪 Running Grounding & Citations Tests...\n');
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

  const sampleSourceMap = new Map([
    [
      'SOURCE_1',
      {
        sourceKey: 'SOURCE_1',
        chunkId: 'chk_os_1',
        documentId: 'doc_os',
        documentTitle: 'Operating Systems.pdf',
        sourceType: 'pdf',
        pageNumber: 15,
        snippet: 'Deadlock is a state where processes wait indefinitely.',
      },
    ],
    [
      '1',
      {
        sourceKey: 'SOURCE_1',
        chunkId: 'chk_os_1',
        documentId: 'doc_os',
        documentTitle: 'Operating Systems.pdf',
        sourceType: 'pdf',
        pageNumber: 15,
        snippet: 'Deadlock is a state where processes wait indefinitely.',
      },
    ],
    [
      'SOURCE_2',
      {
        sourceKey: 'SOURCE_2',
        chunkId: 'chk_net_1',
        documentId: null,
        webSourceId: 'web_rfc',
        documentTitle: 'RFC 793 - TCP',
        sourceType: 'webpage',
        url: 'https://datatracker.ietf.org/doc/html/rfc793',
        snippet: 'TCP provides reliable full-duplex byte stream transmission.',
      },
    ],
  ]);

  it('1. processCitations maps valid [SOURCE_X] tags to normalized numeric citations [1]', () => {
    const rawAnswer = 'Deadlock occurs when resources are held circular [SOURCE_1]. In addition, TCP ensures reliability [SOURCE_2].';
    const { cleanAnswer, citations } = processCitations(rawAnswer, sampleSourceMap);

    assert(cleanAnswer.includes('[1]'), 'Clean answer should contain [1]');
    assert(cleanAnswer.includes('[2]'), 'Clean answer should contain [2]');
    assert.strictEqual(citations.length, 2);
    assert.strictEqual(citations[0].documentTitle, 'Operating Systems.pdf');
    assert.strictEqual(citations[0].pageNumber, 15);
    assert.strictEqual(citations[1].documentTitle, 'RFC 793 - TCP');
    assert.strictEqual(citations[1].url, 'https://datatracker.ietf.org/doc/html/rfc793');
  });

  it('2. processCitations silently drops hallucinated citation tags [SOURCE_99]', () => {
    const rawAnswer = 'Quantum gravity unifies field theory [SOURCE_99]. Deadlock is resource contention [SOURCE_1].';
    const { cleanAnswer, citations } = processCitations(rawAnswer, sampleSourceMap);

    assert(!cleanAnswer.includes('[SOURCE_99]'), 'Should remove invalid citation tag');
    assert(cleanAnswer.includes('[1]'), 'Should preserve valid citation');
    assert.strictEqual(citations.length, 1);
    assert.strictEqual(citations[0].chunkId, 'chk_os_1');
  });

  it('3. processCitations deduplicates repeated citations in text', () => {
    const rawAnswer = 'Processes wait [SOURCE_1]. No progress can occur [SOURCE_1].';
    const { cleanAnswer, citations } = processCitations(rawAnswer, sampleSourceMap);

    assert.strictEqual(citations.length, 1, 'Should only create 1 citation item for same chunk');
    assert(cleanAnswer.includes('[1]'), 'Should replace both with [1]');
  });

  it('4. INSUFFICIENT_INFO_RESPONSE is standardized and safe', () => {
    assert(INSUFFICIENT_INFO_RESPONSE.includes("couldn't find enough information"));
  });

  console.log(`\nGrounding & Citations Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
