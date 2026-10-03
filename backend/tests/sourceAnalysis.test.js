/**
 * Source Analysis & Coverage Test Suite (Phase 10)
 */

const assert = require('assert');
const { analyzeSourceStructure } = require('../src/services/sourceIntelligence/sourceStructureAnalyzer');
const {
  extractKeyTopics,
  extractDefinitions,
  extractKeyConcepts,
  extractTakeawaysAndFacts,
  generateSuggestedQuestions,
} = require('../src/services/sourceIntelligence/sourceMetadataService');
const { generateDeterministicAnalysis } = require('../src/services/sourceIntelligence/sourceAnalyzer');

async function runTests() {
  console.log('🧪 Running Source Analysis & Coverage Tests...\n');
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

  const sampleDocText = `
# Operating Systems Architecture

## 1. Process Management
A Process is defined as an instance of a program in execution.
The operating system creates, schedules, and terminates processes.
Key operational mechanisms include context switching and inter-process communication.

## 2. Memory Management and Virtual Memory
Virtual Memory refers to an abstraction that allows processes to use more memory than physically installed.
Paging divides memory into fixed-size blocks called pages.

## 3. Deadlock Handling
Deadlock is a situation where two or more processes are unable to proceed because each is waiting for a resource held by another.
Four Coffman conditions must hold simultaneously for a deadlock to occur: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.

Important: Deadlock prevention guarantees that at least one of the Coffman conditions cannot hold.
In conclusion, modern operating systems implement sophisticated algorithms to manage hardware resources efficiently.
`;

  const sampleChunks = [
    {
      chunkIndex: 0,
      pageNumber: 1,
      text: '# Operating Systems Architecture\n\n## 1. Process Management\nA Process is defined as an instance of a program in execution.',
    },
    {
      chunkIndex: 1,
      pageNumber: 2,
      text: '## 2. Memory Management and Virtual Memory\nVirtual Memory refers to an abstraction that allows processes to use more memory.',
    },
    {
      chunkIndex: 2,
      pageNumber: 3,
      text: '## 3. Deadlock Handling\nDeadlock is a situation where two or more processes are unable to proceed.\nFour Coffman conditions must hold.',
    },
  ];

  it('1. analyzeSourceStructure extracts headings and page metadata from chunks', () => {
    const sections = analyzeSourceStructure(sampleChunks, sampleDocText);
    assert(Array.isArray(sections), 'Sections should be an array');
    assert(sections.length >= 3, `Expected at least 3 sections, found ${sections.length}`);
    assert(sections.some((s) => s.title.includes('Process') || s.title.includes('Operating')), 'Expected Process or OS section');
  });

  it('2. extractKeyTopics extracts high-frequency domain concepts', () => {
    const topics = extractKeyTopics(sampleDocText);
    assert(Array.isArray(topics), 'Topics must be an array');
    assert(topics.length > 0, 'Should extract at least one topic');
    const topicsLower = topics.map((t) => t.toLowerCase());
    assert(
      topicsLower.some((t) => t.includes('process') || t.includes('memory') || t.includes('deadlock')),
      'Should extract core OS topics'
    );
  });

  it('3. extractDefinitions extracts definition patterns', () => {
    const defs = extractDefinitions(sampleDocText);
    assert(Array.isArray(defs), 'Definitions must be an array');
    assert(defs.length >= 1, 'Should find definitions');
    assert(defs.some((d) => d.term.toLowerCase().includes('process') || d.term.toLowerCase().includes('virtual') || d.term.toLowerCase().includes('deadlock')), 'Should define Process, Virtual Memory or Deadlock');
  });

  it('4. extractKeyConcepts generates concepts with grounded definitions and context', () => {
    const topics = extractKeyTopics(sampleDocText);
    const concepts = extractKeyConcepts(sampleDocText, topics);
    assert(Array.isArray(concepts), 'Concepts must be an array');
    assert(concepts.length > 0, 'Should extract key concepts');
    assert(concepts[0].term && concepts[0].definition, 'Concept must have term and definition');
  });

  it('5. extractTakeawaysAndFacts extracts important takeaways and metrics', () => {
    const { keyTakeaways } = extractTakeawaysAndFacts(sampleDocText);
    assert(Array.isArray(keyTakeaways), 'Takeaways must be an array');
    assert(keyTakeaways.length > 0, 'Should find key takeaways');
    assert(keyTakeaways.some((t) => t.toLowerCase().includes('deadlock') || t.toLowerCase().includes('operating') || t.toLowerCase().includes('conclusion')), 'Should contain significant sentences');
  });

  it('6. generateSuggestedQuestions produces grounded study questions', () => {
    const topics = ['Process Management', 'Virtual Memory', 'Deadlock'];
    const concepts = [{ term: 'Deadlock', definition: 'A situation where processes wait indefinitely.' }];
    const questions = generateSuggestedQuestions(topics, concepts, 'Operating Systems');
    assert(Array.isArray(questions), 'Questions must be an array');
    assert(questions.length >= 3, 'Should generate at least 3 questions');
    assert(questions.some((q) => q.includes('Deadlock') || q.includes('Process')), 'Questions should refer to extracted topics');
  });

  it('7. generateDeterministicAnalysis builds complete structured analysis schema', () => {
    const mockDoc = { title: 'Operating Systems', rawText: sampleDocText, sourceType: 'pdf' };
    const analysis = generateDeterministicAnalysis(mockDoc, sampleChunks);
    assert(analysis.overview && typeof analysis.overview === 'string', 'Overview required');
    assert(Array.isArray(analysis.keyTopics), 'keyTopics array required');
    assert(Array.isArray(analysis.keyConcepts), 'keyConcepts array required');
    assert(Array.isArray(analysis.definitions), 'definitions array required');
    assert(Array.isArray(analysis.keyTakeaways), 'keyTakeaways array required');
    assert(Array.isArray(analysis.sections), 'sections array required');
    assert(Array.isArray(analysis.suggestedQuestions), 'suggestedQuestions array required');
  });

  it('8. Handles empty or sparse source gracefully without errors', () => {
    const emptyDoc = { title: 'Empty Doc', rawText: '', sourceType: 'txt' };
    const analysis = generateDeterministicAnalysis(emptyDoc, []);
    assert(analysis.overview, 'Should provide basic fallback overview');
    assert(Array.isArray(analysis.keyTopics), 'Should return empty array for topics');
  });

  console.log(`\nSource Analysis Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
