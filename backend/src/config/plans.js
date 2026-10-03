const config = require('./env');

/**
 * Centralized Plan Catalog for StudyLM
 */
const PLANS = {
  free: {
    key: 'free',
    name: 'Free Starter',
    description: 'Essential AI research and study tools for students and individual learners.',
    price: 0,
    priceFormatted: '₹0',
    currency: config.billing.currency,
    interval: 'forever',
    providerPlanId: null,
    popular: false,
    quotas: {
      maxNotebooks: parseInt(process.env.LIMIT_FREE_NOTEBOOKS, 10) || 15,
      maxSourcesPerNotebook: parseInt(process.env.LIMIT_FREE_SOURCES_PER_NOTEBOOK, 10) || 30,
      maxFileSizeMB: parseInt(process.env.LIMIT_FREE_MAX_FILE_SIZE_MB, 10) || 25,
      monthlyAiRequests: parseInt(process.env.LIMIT_FREE_MONTHLY_AI, 10) || 300,
      monthlyResearchSessions: parseInt(process.env.LIMIT_FREE_MONTHLY_RESEARCH, 10) || 30,
      monthlyStudyTools: parseInt(process.env.LIMIT_FREE_MONTHLY_STUDY_TOOLS, 10) || 60,
    },
    features: {
      ragChat: true,
      webResearch: true,
      deepResearch: true,
      sourceAnalysis: true,
      studyTools: true,
      researchMemory: true,
      citationDeepLinks: true,
      universalSearch: true,
      dataExport: true,
      priorityProcessing: false,
      teamCollaboration: false,
      dedicatedSupport: false,
    },
    featureList: [
      '15 Notebooks & 30 Sources per notebook',
      '300 Grounded AI chat requests / month',
      '30 Multi-source deep research sessions / month',
      '60 Study tool generations (Flashcards, Quizzes, Notes)',
      'Web page ingestion & URL research',
      'Personal research memory & saved insights',
      'Full data export (JSON)',
    ],
  },
  pro: {
    key: 'pro',
    name: 'Pro Researcher',
    description: 'Supercharged research capacity, larger files, and unlimited deep synthesis.',
    price: config.billing.prices.proMonthly,
    priceFormatted: `₹${config.billing.prices.proMonthly}`,
    currency: config.billing.currency,
    interval: 'month',
    providerPlanId: config.billing.razorpay.proPlanId,
    popular: true,
    quotas: {
      maxNotebooks: parseInt(process.env.LIMIT_PRO_NOTEBOOKS, 10) || 100,
      maxSourcesPerNotebook: parseInt(process.env.LIMIT_PRO_SOURCES_PER_NOTEBOOK, 10) || 200,
      maxFileSizeMB: parseInt(process.env.LIMIT_PRO_MAX_FILE_SIZE_MB, 10) || 100,
      monthlyAiRequests: parseInt(process.env.LIMIT_PRO_MONTHLY_AI, 10) || 3000,
      monthlyResearchSessions: parseInt(process.env.LIMIT_PRO_MONTHLY_RESEARCH, 10) || 500,
      monthlyStudyTools: parseInt(process.env.LIMIT_PRO_MONTHLY_STUDY_TOOLS, 10) || 1000,
    },
    features: {
      ragChat: true,
      webResearch: true,
      deepResearch: true,
      sourceAnalysis: true,
      studyTools: true,
      researchMemory: true,
      citationDeepLinks: true,
      universalSearch: true,
      dataExport: true,
      priorityProcessing: true,
      teamCollaboration: false,
      dedicatedSupport: false,
    },
    featureList: [
      '100 Notebooks & 200 Sources per notebook',
      '3,000 Grounded AI chat requests / month',
      '500 Multi-source deep research sessions / month',
      '1,000 Study tool generations',
      '100 MB maximum document upload size',
      'Priority AI queuing & fastest inference',
      'Citation deep-link preview & contradictions engine',
      'Full data export & enhanced memory retention',
    ],
  },
  enterprise: {
    key: 'enterprise',
    name: 'Enterprise Academic',
    description: 'High-throughput institutional capabilities with dedicated team workspaces.',
    price: config.billing.prices.enterpriseMonthly,
    priceFormatted: `₹${config.billing.prices.enterpriseMonthly}`,
    currency: config.billing.currency,
    interval: 'month',
    providerPlanId: config.billing.razorpay.enterprisePlanId,
    popular: false,
    quotas: {
      maxNotebooks: 1000,
      maxSourcesPerNotebook: 1000,
      maxFileSizeMB: 250,
      monthlyAiRequests: 25000,
      monthlyResearchSessions: 5000,
      monthlyStudyTools: 10000,
    },
    features: {
      ragChat: true,
      webResearch: true,
      deepResearch: true,
      sourceAnalysis: true,
      studyTools: true,
      researchMemory: true,
      citationDeepLinks: true,
      universalSearch: true,
      dataExport: true,
      priorityProcessing: true,
      teamCollaboration: true,
      dedicatedSupport: true,
    },
    featureList: [
      '1,000 Notebooks & 1,000 Sources per notebook',
      '25,000 Grounded AI chat requests / month',
      '5,000 Multi-source deep research sessions / month',
      '10,000 Study tool generations',
      '250 MB maximum document upload size',
      'Dedicated enterprise SLA & priority routing',
      'Custom LLM prompt scoping & security audit log',
      'Dedicated academic support manager',
    ],
  },
};

/**
 * Get plan details by plan key
 *
 * @param {string} planKey
 * @returns {Object}
 */
function getPlan(planKey = 'free') {
  const key = String(planKey || 'free').toLowerCase();
  return PLANS[key] || PLANS.free;
}

/**
 * Get all available public plan definitions
 *
 * @returns {Array<Object>}
 */
function getAllPlans() {
  return Object.values(PLANS);
}

/**
 * Check if target plan is a higher tier than current plan
 *
 * @param {string} currentPlanKey
 * @param {string} targetPlanKey
 * @returns {boolean}
 */
function isUpgrade(currentPlanKey = 'free', targetPlanKey = 'pro') {
  const planWeights = { free: 0, pro: 1, enterprise: 2 };
  const currentWeight = planWeights[currentPlanKey] ?? 0;
  const targetWeight = planWeights[targetPlanKey] ?? 0;
  return targetWeight > currentWeight;
}

module.exports = {
  PLANS,
  getPlan,
  getAllPlans,
  isUpgrade,
};
