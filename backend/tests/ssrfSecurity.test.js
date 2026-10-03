/**
 * Comprehensive SSRF & Web Security Test Suite (Phase 11)
 */

const assert = require('assert');
const { validateUrlForSsrf, isRestrictedIp } = require('../src/services/web/webSecurity');

async function runTests() {
  console.log('🧪 Running Comprehensive SSRF Security Tests (Phase 11)...\n');
  let passed = 0;
  let total = 0;

  async function it(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
    }
  }

  // 1. IP range filters
  await it('1. isRestrictedIp identifies loopback (127.0.0.1 and ::1)', () => {
    assert.strictEqual(isRestrictedIp('127.0.0.1'), true);
    assert.strictEqual(isRestrictedIp('127.10.0.5'), true);
    assert.strictEqual(isRestrictedIp('::1'), true);
  });

  await it('2. isRestrictedIp identifies RFC 1918 private IPv4 subnets', () => {
    assert.strictEqual(isRestrictedIp('10.0.0.1'), true);
    assert.strictEqual(isRestrictedIp('172.16.5.10'), true);
    assert.strictEqual(isRestrictedIp('192.168.1.1'), true);
    assert.strictEqual(isRestrictedIp('100.64.0.1'), true); // CGNAT
  });

  await it('3. isRestrictedIp identifies AWS/GCP cloud metadata IP (169.254.169.254)', () => {
    assert.strictEqual(isRestrictedIp('169.254.169.254'), true);
    assert.strictEqual(isRestrictedIp('169.254.1.1'), true); // Link-local
  });

  await it('4. isRestrictedIp allows valid public IP addresses', () => {
    assert.strictEqual(isRestrictedIp('8.8.8.8'), false);
    assert.strictEqual(isRestrictedIp('1.1.1.1'), false);
    assert.strictEqual(isRestrictedIp('93.184.216.34'), false);
  });

  // 2. URL Scheme and host validation
  await it('5. validateUrlForSsrf blocks non-HTTP/HTTPS schemes (file, ftp, gopher, javascript)', async () => {
    const fileRes = await validateUrlForSsrf('file:///etc/passwd');
    assert.strictEqual(fileRes.valid, false);

    const ftpRes = await validateUrlForSsrf('ftp://10.0.0.1/backup.tar.gz');
    assert.strictEqual(ftpRes.valid, false);

    const jsRes = await validateUrlForSsrf('javascript:alert(1)');
    assert.strictEqual(jsRes.valid, false);
  });

  await it('6. validateUrlForSsrf blocks named internal and metadata hostnames', async () => {
    const localRes = await validateUrlForSsrf('http://localhost:3000/api');
    assert.strictEqual(localRes.valid, false);

    const metaRes = await validateUrlForSsrf('http://metadata.google.internal/computeMetadata/v1/');
    assert.strictEqual(metaRes.valid, false);

    const dotLocal = await validateUrlForSsrf('http://myserver.local/admin');
    assert.strictEqual(dotLocal.valid, false);
  });

  await it('7. validateUrlForSsrf blocks literal private IP URLs', async () => {
    const res1 = await validateUrlForSsrf('http://127.0.0.1:8000/secret');
    assert.strictEqual(res1.valid, false);

    const res2 = await validateUrlForSsrf('http://10.200.0.1/metrics');
    assert.strictEqual(res2.valid, false);

    const res3 = await validateUrlForSsrf('http://169.254.169.254/latest/meta-data/');
    assert.strictEqual(res3.valid, false);
  });

  await it('8. validateUrlForSsrf permits safe, public HTTPS URLs', async () => {
    const res = await validateUrlForSsrf('https://example.com/article');
    assert.strictEqual(res.valid, true);
    assert(res.parsedUrl instanceof URL);
  });

  console.log(`\nSSRF Security Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
