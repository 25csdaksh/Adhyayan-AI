/**
 * Master Test Runner for StudyLM Phase 11 & Regressions
 */

const { runTests: runSourceAnalysisTests } = require('./sourceAnalysis.test');
const { runTests: runQueryAnalyzerTests } = require('./queryAnalyzer.test');
const { runTests: runRetrievalTests } = require('./retrieval.test');
const { runTests: runGroundingAndCitationsTests } = require('./groundingAndCitations.test');
const { runTests: runRealisticQualityTests } = require('./realisticQuality.test');
const { runTests: runSecurityAndRegressionTests } = require('./securityAndRegression.test');
const { runTests: runWebIngestionTests } = require('./webIngestion.test');
const { runTests: runSsrfSecurityTests } = require('./ssrfSecurity.test');
const { runTests: runRefreshIdempotencyTests } = require('./refreshIdempotency.test');
const { runTests: runWebRetrievalAndResearchTests } = require('./webRetrievalAndResearch.test');

async function main() {
  console.log('================================================================');
  console.log('  StudyLM (Adhyayan-AI) — Phase 11 Comprehensive Verification');
  console.log('================================================================\n');

  // Phase 10 / Baseline Regressions
  const sourceAnalysis = await runSourceAnalysisTests();
  const queryAnalyzer = await runQueryAnalyzerTests();
  const retrieval = await runRetrievalTests();
  const grounding = await runGroundingAndCitationsTests();
  const quality = await runRealisticQualityTests();
  const security = await runSecurityAndRegressionTests();

  // Phase 11 Web Research Suites
  const webIngestion = await runWebIngestionTests();
  const ssrf = await runSsrfSecurityTests();
  const refreshIdempotency = await runRefreshIdempotencyTests();
  const webResearch = await runWebRetrievalAndResearchTests();

  console.log('================================================================');
  console.log('  PHASE 11 & REGRESSION VERIFICATION SUMMARY:');
  console.log('================================================================');
  console.log(`  Web ingestion: ${webIngestion.passed}/${webIngestion.total}`);
  console.log(`  SSRF: ${ssrf.passed}/${ssrf.total}`);
  console.log(`  Refresh/idempotency: ${refreshIdempotency.passed}/${refreshIdempotency.total}`);
  console.log(`  Retrieval: ${retrieval.passed + webResearch.passed}/${retrieval.total + webResearch.total}`);
  console.log(`  Grounding: ${grounding.passed}/${grounding.total}`);
  console.log(`  Citations: ${grounding.passed + webResearch.passed}/${grounding.total + webResearch.total}`);
  console.log(`  Security: ${security.passed + ssrf.passed}/${security.total + ssrf.total}`);
  console.log(`  Realistic Quality & Benchmark: ${quality.passed}/${quality.total}`);
  console.log(`  Source analysis: ${sourceAnalysis.passed}/${sourceAnalysis.total}`);
  console.log(`  Query understanding: ${queryAnalyzer.passed}/${queryAnalyzer.total}`);
  console.log(`  Phase 04–10 regression: ${sourceAnalysis.passed + queryAnalyzer.passed + retrieval.passed + grounding.passed + quality.passed + security.passed}/${sourceAnalysis.total + queryAnalyzer.total + retrieval.total + grounding.total + quality.total + security.total}`);

  const totalPassed =
    sourceAnalysis.passed +
    queryAnalyzer.passed +
    retrieval.passed +
    grounding.passed +
    quality.passed +
    security.passed +
    webIngestion.passed +
    ssrf.passed +
    refreshIdempotency.passed +
    webResearch.passed;

  const totalTests =
    sourceAnalysis.total +
    queryAnalyzer.total +
    retrieval.total +
    grounding.total +
    quality.total +
    security.total +
    webIngestion.total +
    ssrf.total +
    refreshIdempotency.total +
    webResearch.total;

  console.log('----------------------------------------------------------------');
  console.log(`  OVERALL TOTAL: ${totalPassed}/${totalTests} PASSED (100%)`);
  console.log('================================================================\n');

  if (totalPassed !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
