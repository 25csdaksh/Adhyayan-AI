import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle,
  Download,
  Clock,
  Compass,
  ListOrdered,
  Award,
  ChevronRight,
  ExternalLink,
  Quote,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CitationCard } from '../chat/CitationCard';

export const SummaryViewer = ({ studyTool, onSelectCitation }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'overview', 'sections', 'concepts', 'questions', 'citations'

  if (!studyTool) {
    return (
      <div className="text-center py-12 text-sm text-[#6B756F]">
        No summary data available.
      </div>
    );
  }

  // Handle both object and parsed JSON result safely
  const result = useMemo(() => {
    if (typeof studyTool.result === 'string') {
      try {
        return JSON.parse(studyTool.result);
      } catch {
        return {};
      }
    }
    return studyTool.result || studyTool || {};
  }, [studyTool]);

  const citations = Array.isArray(studyTool.citations)
    ? studyTool.citations
    : (Array.isArray(result.citations) ? result.citations : []);

  const displayTitle = studyTool.title || result.title || 'Executive Study Summary';
  const displayCreatedAt = studyTool.createdAt || new Date().toISOString();
  const overview = result.overview || result.summary || '';
  const keyPoints = Array.isArray(result.keyPoints) ? result.keyPoints : [];
  const sections = Array.isArray(result.sections) ? result.sections : [];
  const concepts = Array.isArray(result.concepts) ? result.concepts : [];
  const studyQuestions = Array.isArray(result.studyQuestions) ? result.studyQuestions : [];
  const conclusion = result.conclusion || '';
  const mode = result.mode || studyTool.input?.mode || 'detailed';

  // Reading time calculation
  const readingTimeMinutes = useMemo(() => {
    const fullText = [
      overview,
      ...keyPoints,
      ...sections.flatMap((s) => [s.heading, s.content, ...(s.bullets || [])]),
      ...concepts.map((c) => `${c.term} ${c.definition} ${c.context || ''}`),
      ...studyQuestions,
      conclusion,
    ].join(' ');
    const wordCount = fullText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [overview, keyPoints, sections, concepts, studyQuestions, conclusion]);

  const formattedMarkdown = useMemo(() => {
    let md = `# ${displayTitle}\n\n`;
    if (overview) {
      md += `## Executive Overview\n${overview}\n\n`;
    }
    if (keyPoints.length > 0) {
      md += `## Key Takeaways\n${keyPoints.map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}\n\n`;
    }
    if (sections.length > 0) {
      md += `## Detailed Topic Analysis\n`;
      sections.forEach((sec) => {
        md += `### ${sec.heading}\n${sec.content}\n`;
        if (sec.bullets && sec.bullets.length > 0) {
          md += `${sec.bullets.map((b) => `- ${b}`).join('\n')}\n`;
        }
        md += `\n`;
      });
    }
    if (concepts.length > 0) {
      md += `## Key Definitions & Concepts\n`;
      concepts.forEach((c) => {
        md += `- **${c.term}**: ${c.definition}${c.context ? ` *(Context: ${c.context})*` : ''}\n`;
      });
      md += `\n`;
    }
    if (studyQuestions.length > 0) {
      md += `## Study & Discussion Questions\n`;
      studyQuestions.forEach((q, idx) => {
        md += `${idx + 1}. ${q}\n`;
      });
      md += `\n`;
    }
    if (conclusion) {
      md += `## Synthesis & Conclusion\n${conclusion}\n\n`;
    }
    return md.trim();
  }, [displayTitle, overview, keyPoints, sections, concepts, studyQuestions, conclusion]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${displayTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render text with clickable citation badges [1], [2], etc.
  const renderTextWithCitations = (text) => {
    if (!text || typeof text !== 'string') return text;
    const parts = text.split(/(\[\d+\]|\[SOURCE_\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\[(?:SOURCE_)?(\d+)\]$/i);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        const citObj = citations.find((c) => c.citationNumber === citationNum);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => citObj && onSelectCitation && onSelectCitation(citObj)}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-bold bg-[#E8EFEA] text-[#1F5E4B] border border-[#C2D8CD] hover:bg-[#1F5E4B] hover:text-white cursor-pointer transition-all shadow-2xs"
            title={citObj ? `${citObj.documentTitle || 'Source'} (p.${citObj.pageNumber || 1})` : `Citation [${citationNum}]`}
          >
            {citationNum}
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const tabs = [
    { id: 'all', label: 'Full Dossier', icon: Layers },
    { id: 'overview', label: 'Overview', icon: FileText, count: keyPoints.length },
    ...(sections.length > 0 ? [{ id: 'sections', label: 'Deep-Dive', icon: Compass, count: sections.length }] : []),
    ...(concepts.length > 0 ? [{ id: 'concepts', label: 'Glossary', icon: BookOpen, count: concepts.length }] : []),
    ...(studyQuestions.length > 0 ? [{ id: 'questions', label: 'Review Qs', icon: HelpCircle, count: studyQuestions.length }] : []),
    ...(citations.length > 0 ? [{ id: 'citations', label: 'Sources', icon: ExternalLink, count: citations.length }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-white via-[#FAFBF9] to-[#F2F7F4] p-5 rounded-2xl border border-[#E2E7E3] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1F5E4B]/10 text-[#1F5E4B] border border-[#1F5E4B]/20">
                <Sparkles className="w-3.5 h-3.5" />
                StudyLM Executive Dossier
              </span>
              <Badge variant={mode === 'short' ? 'neutral' : 'forest'} size="sm">
                {mode === 'short' ? 'Concise Summary' : 'Detailed Analysis'}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-[#6B756F]">
                <Clock className="w-3.5 h-3.5 text-[#8E9993]" />
                ~{readingTimeMinutes} min read
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#17211D] tracking-tight">
              {displayTitle}
            </h2>

            <p className="text-xs text-[#6B756F]">
              Grounded in <strong className="text-[#17211D]">{citations.length} verified source references</strong> •{' '}
              Generated {new Date(displayCreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#1F5E4B]" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy MD'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Quick Highlights Grid Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[#E8EEEA]">
          <div className="p-2.5 bg-white/80 backdrop-blur rounded-xl border border-[#E2E7E3] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center shrink-0">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#17211D]">{keyPoints.length}</div>
              <div className="text-[11px] text-[#6B756F]">Core Takeaways</div>
            </div>
          </div>

          <div className="p-2.5 bg-white/80 backdrop-blur rounded-xl border border-[#E2E7E3] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#17211D]">{sections.length || 1}</div>
              <div className="text-[11px] text-[#6B756F]">Topic Sections</div>
            </div>
          </div>

          <div className="p-2.5 bg-white/80 backdrop-blur rounded-xl border border-[#E2E7E3] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#17211D]">{concepts.length}</div>
              <div className="text-[11px] text-[#6B756F]">Key Concepts</div>
            </div>
          </div>

          <div className="p-2.5 bg-white/80 backdrop-blur rounded-xl border border-[#E2E7E3] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#17211D]">{citations.length}</div>
              <div className="text-[11px] text-[#6B756F]">Verified Sources</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E2E7E3] no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1F5E4B] text-white shadow-2xs'
                  : 'text-[#6B756F] hover:text-[#17211D] hover:bg-[#FAFBF9]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8E9993]'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#E8EEEA] text-[#6B756F]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Executive Overview */}
      {(activeTab === 'all' || activeTab === 'overview') && overview && (
        <div className="p-5 bg-white rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Executive Synthesis
            </h3>
            <span className="text-[11px] text-[#8E9993]">Primary Summary</span>
          </div>
          <div className="text-sm text-[#17211D] leading-relaxed whitespace-pre-wrap font-normal">
            {renderTextWithCitations(overview)}
          </div>
        </div>
      )}

      {/* SECTION 2: Key Takeaways */}
      {(activeTab === 'all' || activeTab === 'overview') && keyPoints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1F5E4B]" />
              Core Takeaways & Findings
            </h3>
            <span className="text-[11px] text-[#8E9993]">{keyPoints.length} Key Points</span>
          </div>
          <div className="grid gap-3">
            {keyPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 bg-white rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B]/50 hover:shadow-2xs transition-all"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-gradient-to-br from-[#E8EFEA] to-[#D8E9E2] text-[#1F5E4B] flex items-center justify-center text-xs font-black mt-0.5 shadow-2xs">
                  {idx + 1}
                </div>
                <div className="text-sm text-[#17211D] leading-relaxed pt-0.5">
                  {renderTextWithCitations(typeof point === 'string' ? point : JSON.stringify(point))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Detailed Topic Deep-Dive */}
      {(activeTab === 'all' || activeTab === 'sections') && sections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1F5E4B]" />
              Detailed Topic Analysis
            </h3>
            <span className="text-[11px] text-[#8E9993]">{sections.length} Detailed Sections</span>
          </div>

          <div className="grid gap-4">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-2xl border border-[#E2E7E3] hover:border-[#1F5E4B]/40 transition-all space-y-3"
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0F4F2]">
                  <span className="w-6 h-6 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3] text-[#1F5E4B] flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-[#17211D]">
                    {renderTextWithCitations(sec.heading)}
                  </h4>
                </div>

                {sec.content && (
                  <div className="text-sm text-[#2E3B34] leading-relaxed whitespace-pre-wrap">
                    {renderTextWithCitations(sec.content)}
                  </div>
                )}

                {sec.bullets && sec.bullets.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B756F]">
                      Key Highlights
                    </div>
                    <ul className="space-y-1.5">
                      {sec.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs text-[#3D4741]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E4B] mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{renderTextWithCitations(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Concepts & Glossary */}
      {(activeTab === 'all' || activeTab === 'concepts') && concepts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1F5E4B]" />
              Core Definitions & Conceptual Glossary
            </h3>
            <span className="text-[11px] text-[#8E9993]">{concepts.length} Terms</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {concepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl border border-[#E2E7E3] space-y-2 hover:shadow-2xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1F5E4B] uppercase tracking-wide">
                      {concept.term || concept.name || `Concept #${idx + 1}`}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#FAFBF9] text-[#6B756F] border border-[#E2E7E3]">
                      Term
                    </span>
                  </div>
                  <div className="text-xs text-[#2E3B34] leading-relaxed">
                    {renderTextWithCitations(concept.definition || concept.description || '')}
                  </div>
                </div>

                {concept.context && (
                  <div className="pt-2 border-t border-[#F0F4F2] text-[11px] text-[#6B756F] italic">
                    <span className="font-semibold text-[#1F5E4B]">Significance:</span> {renderTextWithCitations(concept.context)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Study & Discussion Questions */}
      {(activeTab === 'all' || activeTab === 'questions') && studyQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1F5E4B]" />
              Self-Assessment & Review Questions
            </h3>
            <span className="text-[11px] text-[#8E9993]">{studyQuestions.length} Questions</span>
          </div>

          <div className="grid gap-2.5">
            {studyQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B]/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#FAFBF9] border border-[#D8E9E2] text-[#1F5E4B] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  Q{idx + 1}
                </div>
                <div className="text-xs font-medium text-[#17211D] leading-relaxed pt-0.5">
                  {renderTextWithCitations(typeof q === 'string' ? q : JSON.stringify(q))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: Synthesis & Conclusion */}
      {(activeTab === 'all' || activeTab === 'overview') && conclusion && (
        <div className="p-4 bg-gradient-to-br from-[#FAFBF9] to-[#F0F6F2] rounded-xl border border-[#D8E9E2] space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" />
            Final Synthesis
          </h4>
          <div className="text-xs text-[#2E3B34] leading-relaxed">
            {renderTextWithCitations(conclusion)}
          </div>
        </div>
      )}

      {/* SECTION 7: Grounded Source Citations */}
      {(activeTab === 'all' || activeTab === 'citations') && citations.length > 0 && (
        <div className="pt-4 border-t border-[#E2E7E3] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F5E4B] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#1F5E4B]" />
              Grounded Source References ({citations.length})
            </h3>
            <span className="text-[11px] text-[#8E9993]">Click to inspect excerpt</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {citations.map((citation, idx) => (
              <CitationCard
                key={idx}
                citation={citation}
                onPreview={(cit) => onSelectCitation && onSelectCitation(cit)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
