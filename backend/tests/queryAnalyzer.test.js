/**
 * Query Analyzer Test Suite (Phase 10)
 */

const assert = require('assert');
const { analyzeQuery, extractQueryConcepts } = require('../src/services/rag/queryAnalyzer');

async function runTests() {
  console.log('🧪 Running Query Analyzer Tests...\n');
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

  it('1. Classifies specific question and extracts concepts', () => {
    const res = analyzeQuery('What is deadlock in operating systems?');
    assert.strictEqual(res.intent, 'specific');
    assert(res.concepts.some((c) => c.toLowerCase() === 'deadlock'), 'Should extract deadlock concept');
  });

  it('2. Classifies summary and overview requests', () => {
    const res1 = analyzeQuery('Summarize this document.');
    const res2 = analyzeQuery('Give me an executive summary and key points.');
    const res3 = analyzeQuery('What does this PDF cover?');
    assert.strictEqual(res1.intent, 'summary');
    assert.strictEqual(res2.intent, 'summary');
    assert.strictEqual(res3.intent, 'summary');
  });

  it('3. Classifies comparison questions and extracts subqueries', () => {
    const res = analyzeQuery('Compare TCP and UDP protocols');
    assert.strictEqual(res.intent, 'comparison');
    assert(res.subQueries.some((s) => s.toUpperCase() === 'TCP'), 'Should extract TCP subquery');
    assert(res.subQueries.some((s) => s.toUpperCase() === 'UDP'), 'Should extract UDP subquery');
  });

  it('4. Classifies definition intent', () => {
    const res = analyzeQuery('What is normalization?');
    assert.strictEqual(res.intent, 'definition');
    assert(res.concepts.some((c) => c.toLowerCase() === 'normalization'), 'Should extract normalization');
  });

  it('5. Classifies page-specific queries with target page', () => {
    const res = analyzeQuery('What does page 20 say about indexing?');
    assert.strictEqual(res.intent, 'page_specific');
    assert.strictEqual(res.targetPage, 20);
  });

  it('6. Resolves follow-up pronoun using conversation history', () => {
    const history = [
      { role: 'user', content: 'What is deadlock?' },
      { role: 'assistant', content: 'Deadlock is a state where processes wait for resources.' },
    ];
    const res = analyzeQuery('Give me a simple example.', history);
    assert.strictEqual(res.intent, 'follow_up');
    assert.strictEqual(res.isFollowUp, true);
    assert(res.resolvedSubject?.toLowerCase().includes('deadlock'), `Expected resolved subject to include deadlock, got ${res.resolvedSubject}`);
    assert(res.effectiveQuery.toLowerCase().includes('deadlock'), 'Effective query should augment with resolved subject');
  });

  it('7. Handles empty and malformed query inputs safely', () => {
    const res = analyzeQuery('');
    assert.strictEqual(res.rawQuery, '');
    assert.strictEqual(res.intent, 'specific');
    assert(Array.isArray(res.concepts), 'Concepts should be array');
  });

  console.log(`\nQuery Analyzer Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
