/**
 * Structured Research Report Generator
 *
 * Formats multi-faceted evidence, comparisons, timelines, contradictions,
 * and knowledge gaps into a cohesive, academic-grade research report.
 */

/**
 * Assemble full markdown research report from synthesis components
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {Object} params.intent
 * @param {Object} params.synthesis
 * @param {Array<Object>} params.citations
 * @param {Array<Object>} params.references
 * @returns {string}
 */
function assembleResearchReport({
  question,
  intent = {},
  synthesis = {},
  citations = [],
  references = [],
}) {
  const q = question || 'Research Inquiry';
  const categoryLabel = (intent.category || 'General').toUpperCase();

  let md = `# Research Report: ${q}\n\n`;
  md += `**Research Focus**: \`${categoryLabel}\` • **Evidence Sources Analyzed**: ${citations.length} grounded citations\n\n`;
  md += `---\n\n`;

  // 1. Executive Summary
  if (synthesis.executiveSummary) {
    md += `## 1. Executive Summary\n\n${synthesis.executiveSummary}\n\n`;
  }

  // 2. Key Findings
  if (synthesis.keyFindings && synthesis.keyFindings.length > 0) {
    md += `## 2. Key Findings\n\n`;
    for (const finding of synthesis.keyFindings) {
      md += `- ${finding}\n`;
    }
    md += `\n`;
  }

  // 3. Detailed Cross-Source Analysis
  if (synthesis.detailedAnalysis) {
    md += `## 3. Detailed Cross-Source Analysis\n\n${synthesis.detailedAnalysis}\n\n`;
  }

  // 4. Cross-Source Comparison (if present)
  if (synthesis.crossSourceComparison) {
    md += `## 4. Cross-Source Comparison\n\n${synthesis.crossSourceComparison}\n\n`;
  }

  // 5. Chronological Timeline (if present)
  if (synthesis.timeline && synthesis.timeline.length > 0) {
    md += `## 5. Chronological Timeline & Milestones\n\n`;
    for (const item of synthesis.timeline) {
      const uncertainBadge = item.isUncertain ? ' *(Estimated Date)*' : '';
      md += `- **${item.date}**${uncertainBadge}: ${item.event} *(Source: ${item.sourceTitle})*\n`;
    }
    md += `\n`;
  }

  // 6. Conflicting Evidence & Contradictions (if present)
  if (synthesis.contradictions && synthesis.contradictions.length > 0) {
    md += `## 6. Conflicting Evidence & Divergent Findings\n\n`;
    md += `> **Notice**: The following discrepancies were identified across distinct sources. Evidence is presented without bias.\n\n`;
    for (const c of synthesis.contradictions) {
      md += `### Discrepancy: ${c.topic}\n`;
      md += `- **${c.sourceA.title}**: "${c.sourceA.claim}"\n`;
      md += `- **${c.sourceB.title}**: "${c.sourceB.claim}"\n`;
      md += `*Analysis Note*: ${c.note}\n\n`;
    }
  }

  // 7. Knowledge Gaps
  if (synthesis.knowledgeGaps && synthesis.knowledgeGaps.length > 0) {
    md += `## 7. Knowledge Gaps & Unanswered Questions\n\n`;
    for (const gap of synthesis.knowledgeGaps) {
      md += `### Knowledge Gap: ${gap.topic}\n`;
      md += `- **Status**: ${gap.reason}\n`;
      if (gap.recommendation) {
        md += `- **Recommendation**: ${gap.recommendation}\n`;
      }
      md += `\n`;
    }
  }

  // 8. Grounded Conclusion
  if (synthesis.conclusion) {
    md += `## 8. Conclusion & Synthesis\n\n${synthesis.conclusion}\n\n`;
  }

  // 9. Bibliography / References
  if (references && references.length > 0) {
    md += `---\n\n## References & Source Provenance\n\n`;
    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      const pageInfo = ref.page ? ` (Page ${ref.page})` : '';
      const domainInfo = ref.domain ? ` [${ref.domain}]` : '';
      const urlInfo = ref.url ? ` - [URL](${ref.url})` : '';
      md += `[${i + 1}] **${ref.title}**${domainInfo}${pageInfo} — *${ref.type.toUpperCase()}*${urlInfo}\n`;
    }
    md += `\n`;
  }

  return md.trim();
}

module.exports = {
  assembleResearchReport,
};
