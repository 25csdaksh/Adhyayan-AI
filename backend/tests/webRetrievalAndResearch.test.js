/**
 * Unified Web Retrieval & Research Mode Test Suite (Phase 11)
 */

const assert = require('assert');
const { buildResearchContext } = require('../src/services/research/researchContextBuilder');
const { processResearchCitations } = require('../src/services/research/researchCitationService');
const { generateDeterministicDevResearch, INSUFFICIENT_RESEARCH_MSG } = require('../src/services/research/researchService');
const { getProvider } = require('../src/services/webSearch/providers');

async function runTests() {
  console.log('🧪 Running Web Retrieval & Research Mode Tests (Phase 11)...\n');
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

  const multiSourceChunks = [
    {
      chunkId: 'chk_doc_1',
      documentId: 'doc_123',
      webSourceId: null,
      sourceKind: 'notebook',
      documentTitle: 'Operating Systems Concepts.pdf',
      sourceType: 'pdf',
      pageNumber: 24,
      chunkIndex: 0,
      score: 0.92,
      text: 'Deadlock detection in multi-threaded environments utilizes wait-for graphs and cycle detection algorithms.',
    },
    {
      chunkId: 'chk_web_1',
      documentId: null,
      webSourceId: 'web_456',
      sourceKind: 'web',
      documentTitle: 'Go Concurrency Patterns — Official Blog',
      sourceType: 'webpage',
      url: 'https://go.dev/blog/pipelines',
      domain: 'go.dev',
      chunkIndex: 0,
      score: 0.88,
      text: 'Pipelines in Go avoid deadlocks by ensuring channels are closed cleanly and goroutines drain buffer capacity.',
    },
  ];

  it('1. buildResearchContext formats distinct [NOTEBOOK_SOURCE_X] and [WEB_SOURCE_X] badges', () => {
    const { contextText, formattedSources, sourceMap } = buildResearchContext(multiSourceChunks);

    assert.strictEqual(formattedSources.length, 2);
    assert(contextText.includes('[NOTEBOOK_SOURCE_1]'), 'Should format notebook source badge');
    assert(contextText.includes('[WEB_SOURCE_1]'), 'Should format web source badge');
    assert(contextText.includes('go.dev'), 'Should include web domain in context');
    assert(contextText.includes('Page 24'), 'Should include page metadata in context');
    assert(sourceMap.has('NOTEBOOK_SOURCE_1'));
    assert(sourceMap.has('WEB_SOURCE_1'));
  });

  it('2. processResearchCitations parses notebook and web source citations accurately', () => {
    const { sourceMap } = buildResearchContext(multiSourceChunks);
    const rawAnswer = 'Deadlocks can be detected via wait-for graphs [NOTEBOOK_SOURCE_1]. In concurrent pipelines, buffer draining prevents deadlocks [WEB_SOURCE_1].';

    const { cleanAnswer, citations } = processResearchCitations(rawAnswer, sourceMap);

    assert(cleanAnswer.includes('[1]'), 'Should normalize first citation');
    assert(cleanAnswer.includes('[2]'), 'Should normalize second citation');
    assert.strictEqual(citations.length, 2);

    const docCit = citations.find((c) => c.sourceKind === 'notebook');
    const webCit = citations.find((c) => c.sourceKind === 'web');

    assert(docCit && docCit.documentTitle.includes('Operating Systems'));
    assert.strictEqual(docCit.pageNumber, 24);
    assert(webCit && webCit.url === 'https://go.dev/blog/pipelines');
    assert.strictEqual(webCit.domain, 'go.dev');
  });

  it('3. generateDeterministicDevResearch synthesizes multi-source research report', () => {
    const { formattedSources } = buildResearchContext(multiSourceChunks);
    const report = generateDeterministicDevResearch('deadlock detection in pipelines', formattedSources);

    assert(report.includes('Grounded Research Synthesis'), 'Report must contain header');
    assert(report.includes('Operating Systems Concepts.pdf'), 'Must cite notebook source');
    assert(report.includes('Source Correlation Note'), 'Must indicate multi-source perspective');
  });

  it('4. Returns safe insufficient information response for unsupported research queries', () => {
    const { formattedSources } = buildResearchContext(multiSourceChunks);
    const report = generateDeterministicDevResearch('What is astrophysics black hole radiation?', formattedSources);

    assert.strictEqual(report, INSUFFICIENT_RESEARCH_MSG);
  });

  it('5. Web search provider defaults to none when unconfigured without fabricating data', async () => {
    const providerFn = getProvider('none');
    assert(typeof providerFn === 'function');
    const results = await providerFn('test query');
    assert(Array.isArray(results) && results.length === 0, 'none provider must return empty array');
  });

  console.log(`\nWeb Retrieval & Research Mode Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
