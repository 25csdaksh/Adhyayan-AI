import React, { useState } from 'react';
import {
  Compass,
  Search,
  Sparkles,
  Globe,
  FileText,
  Layers,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  History,
  ListOrdered,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { researchSessionService } from '../../api/researchSessionService';
import { ResearchPlanViewer } from './ResearchPlanViewer';
import { EvidencePanel } from './EvidencePanel';
import { ClaimEvidenceMatrix } from './ClaimEvidenceMatrix';
import { ContradictionPanel } from './ContradictionPanel';
import { KnowledgeGapsPanel } from './KnowledgeGapsPanel';
import { ResearchReportViewer } from './ResearchReportViewer';
import { ResearchHistoryPanel } from './ResearchHistoryPanel';

export const ResearchPanel = ({ notebookId, onSelectCitation }) => {
  const [activeTab, setActiveTab] = useState('research'); // 'research' | 'history'
  const [query, setQuery] = useState('');
  const [sourceScope, setSourceScope] = useState('all'); // 'notebook' | 'web' | 'all'
  const [isSearching, setIsSearching] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const toast = useToast();

  const handleRunResearch = async (searchQuery = query) => {
    const targetQuery = searchQuery || query;
    if (!targetQuery || !targetQuery.trim()) {
      toast.error('Please enter a research topic or question');
      return;
    }

    if (!notebookId) {
      toast.error('Notebook ID is required');
      return;
    }

    setIsSearching(true);
    try {
      const res = await researchSessionService.createResearchSession(notebookId, {
        query: targetQuery.trim(),
        sourceScope,
        topK: 10,
      });

      if (res?.data?.session) {
        setActiveSession(res.data.session);
        toast.success('Research synthesis completed!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Research synthesis failed');
    } finally {
      setIsSearching(false);
    }
  };

  const exampleQueries = [
    'Compare the two approaches described in my sources',
    'What is the timeline of core milestones and developments?',
    'What are the advantages, trade-offs, and limitations?',
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E7E3]">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1F5E4B]" />
            Advanced Research & Synthesis
          </h3>
          <p className="text-[11px] text-[#6B756F]">
            Deterministic cross-source inquiry, claim verification, and academic reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-[#F2F5F3] rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('research')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'research'
                  ? 'bg-white text-[#1F5E4B] shadow-2xs font-bold'
                  : 'text-[#6B756F] hover:text-[#17211D]'
              }`}
            >
              Active Inquiry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-white text-[#1F5E4B] shadow-2xs font-bold'
                  : 'text-[#6B756F] hover:text-[#17211D]'
              }`}
            >
              <History className="w-3 h-3" />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'history' ? (
        <ResearchHistoryPanel
          notebookId={notebookId}
          onSelectSession={(s) => {
            setActiveSession(s);
            setActiveTab('research');
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Query Formulation Card */}
          <div className="p-4 bg-white rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-4">
            {/* Scope Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B756F]">
                Evidence Scope:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSourceScope('all')}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sourceScope === 'all'
                      ? 'bg-[#E8F2EE] border-[#1F5E4B] text-[#1F5E4B]'
                      : 'bg-white border-[#E2E7E3] text-[#6B756F] hover:bg-[#F2F5F3]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Sources</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceScope('notebook')}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sourceScope === 'notebook'
                      ? 'bg-[#E8F2EE] border-[#1F5E4B] text-[#1F5E4B]'
                      : 'bg-white border-[#E2E7E3] text-[#6B756F] hover:bg-[#F2F5F3]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notebook Docs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceScope('web')}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sourceScope === 'web'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-[#E2E7E3] text-[#6B756F] hover:bg-[#F2F5F3]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Web Sources</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a complex research question, comparison, or timeline inquiry..."
                  rows={3}
                  className="w-full p-3 text-xs sm:text-sm bg-[#FAFBF9] border border-[#E2E7E3] rounded-xl focus:outline-none focus:border-[#1F5E4B] focus:bg-white transition-all text-[#17211D] placeholder:text-[#8E9993] resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-[#8E9993]">
                  {query.length} / 2000 chars
                </div>

                <Button
                  variant="primary"
                  size="md"
                  leftIcon={isSearching ? Loader2 : Sparkles}
                  disabled={isSearching || !query.trim()}
                  onClick={() => handleRunResearch()}
                >
                  {isSearching ? 'Synthesizing...' : 'Synthesize Research'}
                </Button>
              </div>
            </div>

            {/* Sample Inquiries */}
            {!activeSession && !isSearching && (
              <div className="pt-2 border-t border-[#EDF1EE] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9993]">
                  Suggested Research Archetypes:
                </span>
                <div className="space-y-1">
                  {exampleQueries.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(ex);
                        handleRunResearch(ex);
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs text-[#4F5B54] hover:text-[#17211D] hover:bg-[#F2F5F3] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">"{ex}"</span>
                      <ArrowRight className="w-3 h-3 text-[#8E9993] group-hover:text-[#1F5E4B] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Research Progress State */}
          {isSearching && (
            <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center mx-auto shadow-2xs animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#17211D]">
                  Conducting Multi-Source Research
                </h4>
                <p className="text-xs text-[#6B756F]">
                  Formulating plan • Retrieving evidence • Validating claims • Cross-synthesizing
                </p>
              </div>
            </div>
          )}

          {/* Results Sections */}
          {activeSession && !isSearching && (
            <div className="space-y-5">
              {/* 1. Research Plan Viewer */}
              {activeSession.researchPlan && (
                <ResearchPlanViewer plan={activeSession.researchPlan} />
              )}

              {/* 2. Structured Report Viewer */}
              <ResearchReportViewer
                session={activeSession}
                notebookId={notebookId}
                onSelectCitation={onSelectCitation}
              />

              {/* 3. Claim-Evidence Matrix */}
              {activeSession.claims && (
                <ClaimEvidenceMatrix
                  claims={activeSession.claims}
                  onSelectCitation={onSelectCitation}
                />
              )}

              {/* 4. Validated Source Evidence Excerpts */}
              {activeSession.evidence && (
                <EvidencePanel
                  evidence={activeSession.evidence}
                  onSelectCitation={onSelectCitation}
                />
              )}

              {/* 5. Contradictions Panel */}
              {activeSession.synthesis?.contradictions && (
                <ContradictionPanel
                  contradictions={activeSession.synthesis.contradictions}
                />
              )}

              {/* 6. Knowledge Gaps Panel */}
              {activeSession.synthesis?.knowledgeGaps && (
                <KnowledgeGapsPanel
                  knowledgeGaps={activeSession.synthesis.knowledgeGaps}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
