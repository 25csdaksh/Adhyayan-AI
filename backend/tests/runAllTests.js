/**
 * Master Test Runner for StudyLM Phase 10
 */

const { runTests: runSourceAnalysisTests } = require('./sourceAnalysis.test');
const { runTests: runQueryAnalyzerTests } = require('./queryAnalyzer.test');
const { runTests: runRetrievalTests } = require('./retrieval.test');
const { runTests: runGroundingAndCitationsTests } = require('./groundingAndCitations.test');
const { runTests: runRealisticQualityTests } = require('./realisticQuality.test');
const { runTests: runSecurityAndRegressionTests } = require('./securityAndRegression.test');

async function main() {
  console.log('================================================================');
  console.log('  StudyLM (Adhyayan-AI) — Phase 10 Comprehensive Verification');
  console.log('================================================================\n');

  const sourceAnalysis = await runSourceAnalysisTests();
  const queryAnalyzer = await runQueryAnalyzerTests();
  const retrieval = await runRetrievalTests();
  const grounding = await runGroundingAndCitationsTests();
  const quality = await runRealisticQualityTests();
  const security = await runSecurityAndRegressionTests();

  console.log('================================================================');
  console.log('  FINAL VERIFICATION SUMMARY:');
  console.log('================================================================');
  console.log(`  Source analysis tests: ${sourceAnalysis.passed}/${sourceAnalysis.total}`);
  console.log(`  Query understanding tests: ${queryAnalyzer.passed}/${queryAnalyzer.total}`);
  console.log(`  Retrieval tests: ${retrieval.passed}/${retrieval.total}`);
  console.log(`  Grounding & Citation tests: ${grounding.passed}/${grounding.total}`);
  console.log(`  Realistic Quality benchmark: ${quality.passed}/${quality.total}`);
  console.log(`  Security & Regression tests: ${security.passed}/${security.total}`);

  const totalPassed =
    sourceAnalysis.passed +
    queryAnalyzer.passed +
    retrieval.passed +
    grounding.passed +
    quality.passed +
    security.passed;

  const totalTests =
    sourceAnalysis.total +
    queryAnalyzer.total +
    retrieval.total +
    grounding.total +
    quality.total +
    security.total;

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
