/**
 * Controlled Research Planner
 *
 * Generates a bounded, deterministic list of research sub-questions (2 to 4 maximum)
 * to guide multi-source evidence retrieval without unbounded agent loops.
 */

const MAX_SUB_QUESTIONS = 4;
const MIN_SUB_QUESTIONS = 2;

/**
 * Generate a bounded research plan based on research intent and query
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {Object} params.intent
 * @param {Array<string>} [params.sourceTitles=[]]
 * @param {Object} [params.notebookMemory={}]
 * @returns {Array<{ stepNumber: number, subQuestion: string, purpose: string, status: string, evidenceCount: number }>}
 */
function generateResearchPlan({ question = '', intent = {}, sourceTitles = [], notebookMemory = {} }) {
  const cleanQ = (question || '').trim();
  const category = intent.category || 'general';
  const comparisonTargets = intent.comparisonTargets || [];
  const entities = intent.entities || [];

  const plan = [];

  switch (category) {
    case 'compare': {
      if (comparisonTargets.length >= 2) {
        const targetA = comparisonTargets[0];
        const targetB = comparisonTargets[1];
        plan.push({
          stepNumber: 1,
          subQuestion: `What are the core characteristics, methodology, and definitions of ${targetA}?`,
          purpose: `Establish baseline facts and evidence for ${targetA}`,
          status: 'pending',
          evidenceCount: 0,
        });
        plan.push({
          stepNumber: 2,
          subQuestion: `What are the core characteristics, methodology, and definitions of ${targetB}?`,
          purpose: `Establish baseline facts and evidence for ${targetB}`,
          status: 'pending',
          evidenceCount: 0,
        });
        plan.push({
          stepNumber: 3,
          subQuestion: `How do ${targetA} and ${targetB} compare regarding advantages, trade-offs, and differences?`,
          purpose: `Direct comparative analysis and contrast`,
          status: 'pending',
          evidenceCount: 0,
        });
      } else {
        plan.push({
          stepNumber: 1,
          subQuestion: `What are the distinct approaches or entities mentioned in "${cleanQ}"?`,
          purpose: `Identify comparative subjects`,
          status: 'pending',
          evidenceCount: 0,
        });
        plan.push({
          stepNumber: 2,
          subQuestion: `What evidence and specific metrics describe the differences and trade-offs?`,
          purpose: `Extract cross-entity comparison data`,
          status: 'pending',
          evidenceCount: 0,
        });
      }
      break;
    }

    case 'timeline': {
      plan.push({
        stepNumber: 1,
        subQuestion: `What initial events, dates, or foundational milestones are documented for "${cleanQ}"?`,
        purpose: `Establish chronological starting point`,
        status: 'pending',
        evidenceCount: 0,
      });
      plan.push({
        stepNumber: 2,
        subQuestion: `What subsequent developments, evolution phases, and key outcomes occurred over time?`,
        purpose: `Trace chronological progression`,
        status: 'pending',
        evidenceCount: 0,
      });
      break;
    }

    case 'pros_cons': {
      plan.push({
        stepNumber: 1,
        subQuestion: `What advantages, benefits, and positive outcomes are evidenced for "${cleanQ}"?`,
        purpose: `Collect supportive strengths`,
        status: 'pending',
        evidenceCount: 0,
      });
      plan.push({
        stepNumber: 2,
        subQuestion: `What limitations, disadvantages, risks, and drawbacks are documented?`,
        purpose: `Collect critical limitations`,
        status: 'pending',
        evidenceCount: 0,
      });
      break;
    }

    case 'cause_effect': {
      plan.push({
        stepNumber: 1,
        subQuestion: `What underlying causes, mechanisms, or primary factors are identified for "${cleanQ}"?`,
        purpose: `Identify causal origins`,
        status: 'pending',
        evidenceCount: 0,
      });
      plan.push({
        stepNumber: 2,
        subQuestion: `What resulting impacts, outcomes, and long-term effects are demonstrated?`,
        purpose: `Trace concrete consequences`,
        status: 'pending',
        evidenceCount: 0,
      });
      break;
    }

    case 'definition':
    case 'explain': {
      plan.push({
        stepNumber: 1,
        subQuestion: `What is the foundational definition, context, and core purpose of "${cleanQ}"?`,
        purpose: `Define foundational concepts`,
        status: 'pending',
        evidenceCount: 0,
      });
      plan.push({
        stepNumber: 2,
        subQuestion: `What key mechanisms, components, and practical examples are detailed in the sources?`,
        purpose: `Explain detailed operation and usage`,
        status: 'pending',
        evidenceCount: 0,
      });
      break;
    }

    case 'analyze':
    case 'investigate':
    case 'evaluate_evidence':
    default: {
      plan.push({
        stepNumber: 1,
        subQuestion: `What primary claims and core findings exist in the sources regarding "${cleanQ}"?`,
        purpose: `Gather primary evidence`,
        status: 'pending',
        evidenceCount: 0,
      });
      plan.push({
        stepNumber: 2,
        subQuestion: `What supporting evidence, empirical details, and potential limitations or nuances are noted?`,
        purpose: `Analyze nuances and empirical backing`,
        status: 'pending',
        evidenceCount: 0,
      });
      break;
    }
  }

  // Ensure bounded length (2 to 4 sub-questions)
  return plan.slice(0, MAX_SUB_QUESTIONS);
}

module.exports = {
  generateResearchPlan,
  MAX_SUB_QUESTIONS,
  MIN_SUB_QUESTIONS,
};
