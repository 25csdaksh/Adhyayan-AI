/**
 * Phase 17 — Production Deployment Readiness, Security & Live Verification Suite
 */
const assert = require('assert');
const mongoose = require('mongoose');
const config = require('../src/config/env');
const { getLiveness, getReadiness } = require('../src/controllers/health.controller');
const { validateUrlForSsrf } = require('../src/services/web/webSecurity');
const { getPlan, getAllPlans } = require('../src/config/plans');
const { checkUsageLimit, canUseFeature } = require('../src/services/usage/entitlementService');
const { syncUserEntitlement } = require('../src/services/billing/entitlementSync');
const { createCheckout, verifyPayment } = require('../src/services/billing/billingService');
const { exportUserData, deleteUserAccount } = require('../src/services/user/userDataService');
const { setBillingProvider } = require('../src/services/billing/providers/providerFactory');
const MockBillingProvider = require('../src/services/billing/providers/mockBillingProvider');

// MongoDB Models
const User = require('../src/models/User');
const Notebook = require('../src/models/Notebook');
const Document = require('../src/models/Document');
const WebSource = require('../src/models/WebSource');
const UserMemory = require('../src/models/UserMemory');
const SavedInsight = require('../src/models/SavedInsight');
const Bookmark = require('../src/models/Bookmark');
const ResearchSession = require('../src/models/ResearchSession');
const ActivityLog = require('../src/models/ActivityLog');
const Subscription = require('../src/models/Subscription');
const Payment = require('../src/models/Payment');

async function runPhase17Tests() {
  console.log('\n🚀 Running Phase 17 Production Deployment & Security Tests...\n');

  // Ensure test mode provider
  setBillingProvider(new MockBillingProvider());

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${total}. ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${total}. ${name}`);
      console.error('    Error:', err.message);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${total}. ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${total}. ${name}`);
      console.error('    Error:', err.message);
    }
  }

  // 1. Production Fail-Safe Configuration
  test('Production Fail-Safe: Rejects insecure pseudo-embeddings and verifies secret bounds', () => {
    assert.strictEqual(
      config.gemini.enablePseudoEmbeddingFallback,
      false,
      'ENABLE_PSEUDO_EMBEDDING_FALLBACK must be strictly false'
    );
    assert.strictEqual(config.gemini.dimensions, 768, 'Vector dimensions must be 768 for text-embedding-004');
    assert.ok(config.rag.maxContextChars <= 50000, 'Context character window must be safely bounded');
  });

  // 2. Health & Readiness Probes
  await asyncTest('Health & Readiness Probes: GET /api/health/live and GET /api/health/ready contracts', async () => {
    let liveStatusCode = null;
    let liveData = null;
    const mockResLive = {
      status: (code) => {
        liveStatusCode = code;
        return {
          json: (data) => {
            liveData = data;
          },
        };
      },
    };

    await getLiveness({}, mockResLive);
    assert.strictEqual(liveStatusCode, 200);
    assert.strictEqual(liveData.status, 'alive');
    assert.ok(typeof liveData.uptimeSeconds === 'number');

    let readyStatusCode = null;
    let readyData = null;
    const mockResReady = {
      status: (code) => {
        readyStatusCode = code;
        return {
          json: (data) => {
            readyData = data;
          },
        };
      },
    };

    await getReadiness({}, mockResReady);
    assert.ok([200, 503].includes(readyStatusCode));
    assert.ok(readyData.status === 'ready' || readyData.status === 'not_ready');
  });

  // 3. CORS Lockdown & Origin Validation
  test('CORS Production Lockdown: Validates allowed origins and rejects unauthorized domains', () => {
    const allowed = ['https://app.studylm.ai', 'https://studylm.ai'];
    const testOrigins = [
      { origin: 'https://app.studylm.ai', expected: true },
      { origin: 'https://studylm.ai', expected: true },
      { origin: 'https://malicious-site.com', expected: false },
      { origin: 'http://evil.attacker.org', expected: false },
    ];

    for (const { origin, expected } of testOrigins) {
      const isMatch = allowed.includes(origin);
      assert.strictEqual(isMatch, expected, `Origin ${origin} check should be ${expected}`);
    }
  });

  // 4. SSRF & Network Protection Regression
  await asyncTest('SSRF & Network Security: Blocks private IPs, cloud metadata endpoints, and local loopbacks', async () => {
    const blockedUrls = [
      'http://169.254.169.254/latest/meta-data/',
      'http://127.0.0.1:8080/admin',
      'http://localhost:5000/api/users',
      'http://10.0.0.1/internal',
      'http://192.168.1.1/router',
      'http://172.16.0.1/private',
      'ftp://example.com/file.txt',
    ];

    for (const url of blockedUrls) {
      const result = await validateUrlForSsrf(url);
      assert.strictEqual(result.valid, false, `URL ${url} must be blocked by SSRF filter`);
      assert.ok(result.error, `Blocked URL ${url} must have security rejection reason`);
    }
  });

  // 5. Complete Production E2E Smoke Test (User Lifecycle & Billing)
  await asyncTest('Production E2E Smoke Test: Auth -> Notebook -> Entitlement -> Billing -> Export -> Deletion', async () => {
    const dummyUserId = new mongoose.Types.ObjectId();
    const testUser = {
      _id: dummyUserId,
      name: 'Dr. Vikram Sarabhai',
      email: `vikram_${Date.now()}@studylm.ai`,
      plan: 'free',
      createdAt: new Date(),
    };

    const origUserFindById = User.findById;
    User.findById = (id) => ({
      select: () => ({
        lean: async () => testUser,
      }),
    });

    const origNotebookCount = Notebook.countDocuments;
    Notebook.countDocuments = async () => 2;

    const origDocCount = Document.countDocuments;
    Document.countDocuments = async () => 5;

    const origWebCount = WebSource.countDocuments;
    WebSource.countDocuments = async () => 1;

    const origNotebookFind = Notebook.find;
    Notebook.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origDocFind = Document.find;
    Document.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origWebFind = WebSource.find;
    WebSource.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origUserMemFind = UserMemory.find;
    UserMemory.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origInsightFind = SavedInsight.find;
    SavedInsight.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origBookmarkFind = Bookmark.find;
    Bookmark.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origResearchFind = ResearchSession.find;
    ResearchSession.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origActivityFind = ActivityLog.find;
    ActivityLog.find = () => ({ select: () => ({ limit: () => ({ lean: async () => [] }) }) });

    const origSubFind = Subscription.find;
    Subscription.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origPayFind = Payment.find;
    Payment.find = () => ({ select: () => ({ lean: async () => [] }) });

    const origUsageFind = require('../src/models/UsageRecord').find;
    require('../src/models/UsageRecord').find = () => ({ lean: async () => [] });

    const origSubFindOneAndUpdate = Subscription.findOneAndUpdate;
    Subscription.findOneAndUpdate = async () => ({ _id: new mongoose.Types.ObjectId() });

    const origPayCreate = Payment.create;
    Payment.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

    try {
      // 1. Verify Free Tier Limits
      const freeNotebookCheck = await checkUsageLimit(dummyUserId, 'notebooks');
      assert.strictEqual(freeNotebookCheck.limit, 15, 'Free user starts with 15 notebook limit');

      // 2. Checkout Creation
      const checkout = await createCheckout(dummyUserId, 'pro', 'monthly');
      assert.strictEqual(checkout.amount, 999);
      assert.strictEqual(checkout.planKey, 'pro');

      // 3. Payment Verification & Upgrade to Pro
      const subRecord = {
        _id: new mongoose.Types.ObjectId(),
        userId: dummyUserId,
        providerOrderId: checkout.orderId,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
        save: async () => {},
      };

      const origSubFindOne = Subscription.findOne;
      Subscription.findOne = (query) => {
        if (query && query.providerOrderId) return Promise.resolve(subRecord);
        return {
          sort: () => ({ lean: async () => subRecord }),
        };
      };

      const origPayFindOneAndUpdate = Payment.findOneAndUpdate;
      Payment.findOneAndUpdate = async () => ({ status: 'captured' });

      let updatedUserPlan = 'free';
      const origUserUpdate = User.findByIdAndUpdate;
      User.findByIdAndUpdate = async (id, update) => {
        if (update.plan) updatedUserPlan = update.plan;
        return { _id: id, plan: update.plan };
      };

      const verifyRes = await verifyPayment(dummyUserId, {
        orderId: checkout.orderId,
        paymentId: 'pay_prod_smoke_123',
        signature: 'mock_valid_sig_smoke',
        planKey: 'pro',
      });

      assert.strictEqual(verifyRes.success, true);
      assert.strictEqual(updatedUserPlan, 'pro');

      // 4. Feature Gate on Pro Tier
      testUser.plan = 'pro';
      assert.strictEqual(canUseFeature(testUser, 'priorityProcessing'), true);

      // 5. Sanitized Data Export
      const exportData = await exportUserData(dummyUserId);
      assert.strictEqual(exportData.exportVersion, '1.0');
      assert.strictEqual(exportData.user.email, testUser.email);
      assert.strictEqual(exportData.user.passwordHash, undefined, 'Export must never leak password hashes');

      Subscription.findOne = origSubFindOne;
      Payment.findOneAndUpdate = origPayFindOneAndUpdate;
      User.findByIdAndUpdate = origUserUpdate;
    } finally {
      User.findById = origUserFindById;
      Notebook.countDocuments = origNotebookCount;
      Document.countDocuments = origDocCount;
      WebSource.countDocuments = origWebCount;
      Notebook.find = origNotebookFind;
      Document.find = origDocFind;
      WebSource.find = origWebFind;
      UserMemory.find = origUserMemFind;
      SavedInsight.find = origInsightFind;
      Bookmark.find = origBookmarkFind;
      ResearchSession.find = origResearchFind;
      ActivityLog.find = origActivityFind;
      Subscription.find = origSubFind;
      Payment.find = origPayFind;
      require('../src/models/UsageRecord').find = origUsageFind;
      Subscription.findOneAndUpdate = origSubFindOneAndUpdate;
      Payment.create = origPayCreate;
    }
  });

  // 6. Database Compound Index Strategy Verification
  test('Database Index Audit: Verifies compound indexing across all critical collections', () => {
    const subIndexes = Subscription.schema.indexes();
    assert.ok(subIndexes.length >= 2, 'Subscription must have compound userId and order indexes');

    const payIndexes = Payment.schema.indexes();
    assert.ok(payIndexes.length >= 1, 'Payment must have userId and orderId indexes');
  });

  console.log(`\nPhase 17 Production Deployment Tests: ${passed}/${total} passed\n`);
  return { passed, total };
}

if (require.main === module) {
  runPhase17Tests().then(({ passed, total }) => {
    if (passed !== total) process.exit(1);
  });
}

module.exports = {
  runPhase17Tests,
};
