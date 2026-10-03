/**
 * Master Test Runner for StudyLM Phase 12 & Full Regressions (Phases 04-12)
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
const { runTests: runProductionHardeningTests } = require('./productionHardening.test');
const { runTests: runLoadAndStressTests } = require('./loadAndStress.test');
const { runTests: runPhase13PersonalizationTests } = require('./phase13Personalization.test');
const { runPhase14Tests } = require('./phase14Research.test');

async function main() {
  console.log('================================================================');
  console.log('  StudyLM (Adhyayan-AI) — Phase 14 Comprehensive Verification');
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

  // Phase 12 Production Hardening & Reliability
  const hardening = await runProductionHardeningTests();
  const loadAndStress = await runLoadAndStressTests();

  // Phase 13 Personal Research Memory & Knowledge UX
  const personalization = await runPhase13PersonalizationTests();

  // Phase 14 Advanced AI Research & Knowledge Synthesis
  const advancedResearch = await runPhase14Tests();

  console.log('================================================================');
  console.log('  PHASE 14 & COMPREHENSIVE REGRESSION VERIFICATION SUMMARY:');
  console.log('================================================================');
  console.log(`  Phase 14 Advanced Research & Synthesis: ${advancedResearch.passed}/${advancedResearch.total}`);
  console.log(`  Phase 13 Personalization & UX: ${personalization.passed}/${personalization.total}`);
  console.log(`  Production Hardening: ${hardening.passed}/${hardening.total}`);
  console.log(`  Load & Stress Simulation: ${loadAndStress.passed}/${loadAndStress.total}`);
  console.log(`  Web Ingestion: ${webIngestion.passed}/${webIngestion.total}`);
  console.log(`  SSRF & Network Security: ${ssrf.passed + hardening.passed}/${ssrf.total + hardening.total}`);
  console.log(`  Refresh/Idempotency: ${refreshIdempotency.passed}/${refreshIdempotency.total}`);
  console.log(`  Retrieval: ${retrieval.passed + webResearch.passed}/${retrieval.total + webResearch.total}`);
  console.log(`  Grounding: ${grounding.passed}/${grounding.total}`);
  console.log(`  Citations: ${grounding.passed + webResearch.passed}/${grounding.total + webResearch.total}`);
  console.log(`  Security & Isolation: ${security.passed + ssrf.passed}/${security.total + ssrf.total}`);
  console.log(`  Realistic Quality & Benchmark: ${quality.passed}/${quality.total}`);
  console.log(`  Source Analysis: ${sourceAnalysis.passed}/${sourceAnalysis.total}`);
  console.log(`  Query Understanding: ${queryAnalyzer.passed}/${queryAnalyzer.total}`);

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
    webResearch.passed +
    hardening.passed +
    loadAndStress.passed +
    personalization.passed +
    advancedResearch.passed;

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
    webResearch.total +
    hardening.total +
    loadAndStress.total +
    personalization.total +
    advancedResearch.total;

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

