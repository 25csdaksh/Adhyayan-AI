/**
 * Web Ingestion & HTML Extraction Test Suite (Phase 11)
 */

const assert = require('assert');
const { extractWebContent } = require('../src/services/web/webExtractor');
const { canonicalizeUrl, extractDomain } = require('../src/services/web/urlCanonicalizer');

async function runTests() {
  console.log('🧪 Running Web Ingestion & HTML Extraction Tests (Phase 11)...\n');
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

  const sampleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Understanding Modern Computer Networks — TechDocs</title>
  <meta name="description" content="A deep dive into OSI model layers, TCP congestion control, and routing algorithms." />
  <meta property="article:published_time" content="2026-05-15T10:00:00Z" />
  <link rel="canonical" href="https://techdocs.example.com/networks/guide" />
  <style>body { font-family: sans-serif; } .ad-banner { display: block; }</style>
  <script>console.log("tracking pixel");</script>
</head>
<body>
  <nav class="navbar"><a href="/">Home</a><a href="/about">About</a></nav>
  <header><h1>Header Navigation</h1></header>
  <div class="ads advertisement">Special Offer - Buy Now!</div>
  <main id="content">
    <h1>Computer Networks Architecture</h1>
    <p>Computer networks establish standardized communication protocols across distributed computing hardware.</p>
    <h2>Transport Layer Protocols</h2>
    <p>TCP provides reliable, stream-oriented data transfer with flow control and congestion avoidance.</p>
    <p>UDP is a connectionless transport protocol designed for minimal latency overhead.</p>
  </main>
  <aside class="sidebar">Related Articles</aside>
  <footer><p>© 2026 TechDocs Inc. All rights reserved.</p></footer>
</body>
</html>
`;

  it('1. Extracts clean title from og tags, title tag, or h1', () => {
    const extracted = extractWebContent(sampleHtml, 'https://techdocs.example.com/networks/guide');
    assert(extracted.title.includes('Understanding Modern Computer Networks'), `Expected title to match, got: ${extracted.title}`);
  });

  it('2. Extracts metadata: description, canonical URL, domain, and publication date', () => {
    const extracted = extractWebContent(sampleHtml, 'https://techdocs.example.com/networks/guide');
    assert(extracted.description.includes('OSI model layers'), 'Description should match');
    assert.strictEqual(extracted.domain, 'techdocs.example.com');
    assert.strictEqual(extracted.canonicalUrl, 'https://techdocs.example.com/networks/guide');
    assert(extracted.publishedAt instanceof Date, 'Published date should be parsed');
    assert.strictEqual(extracted.publishedAt.getUTCFullYear(), 2026);
  });

  it('3. Strips scripts, styles, navigation, ads, and footers from main content', () => {
    const extracted = extractWebContent(sampleHtml, 'https://techdocs.example.com/networks/guide');
    const text = extracted.mainText;

    assert(!text.includes('tracking pixel'), 'Should strip script tags');
    assert(!text.includes('Special Offer'), 'Should strip advertisement divs');
    assert(!text.includes('Header Navigation'), 'Should strip header navigation');
    assert(!text.includes('All rights reserved'), 'Should strip footer noise');
    assert(text.includes('Transport Layer Protocols'), 'Must retain main article headings');
    assert(text.includes('TCP provides reliable'), 'Must retain main paragraph body');
  });

  it('4. Handles plain text web documents and raw text cleanly', () => {
    const plainText = 'RFC 793: Transmission Control Protocol Specification.\nTCP is connection-oriented.';
    const extracted = extractWebContent(plainText, 'https://www.ietf.org/rfc/rfc793.txt');
    assert(extracted.mainText.includes('Transmission Control Protocol'));
    assert.strictEqual(extracted.domain, 'ietf.org');
  });

  it('5. Handles empty and malformed HTML gracefully without throwing', () => {
    const extracted = extractWebContent('', 'https://example.com/empty');
    assert.strictEqual(extracted.mainText, '');
    assert.strictEqual(extracted.charCount, 0);
  });

  console.log(`\nWeb Ingestion Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
