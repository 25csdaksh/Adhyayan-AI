import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  List,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Loader2,
  Layers,
  FileText,
  Send,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { documentService } from '../../api/documentService';

export const SourceSummaryModal = ({
  isOpen,
  onClose,
  document,
  notebookId,
  onAskQuestion,
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && document?._id && notebookId) {
      loadAnalysis();
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen, document?._id, notebookId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await documentService.getDocumentAnalysis(notebookId, document._id);
      setAnalysis(res.data?.analysis || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load source analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const res = await documentService.analyzeDocument(notebookId, document._id);
      setAnalysis(res.data?.analysis || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze source');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#1F5E4B]" />
          <span className="truncate max-w-[450px]">
            {document?.title || 'Source Intelligence & Summary'}
          </span>
        </div>
      }
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        {/* Source Header Meta */}
        <div className="flex items-center justify-between p-3 bg-[#FAFBF9] border border-[#E2E7E3] rounded-xl flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm">
              {document?.sourceType?.toUpperCase() || 'DOCUMENT'}
            </Badge>
            {document?.metadata?.pageCount && (
              <span className="text-xs text-[#6B756F]">
                {document.metadata.pageCount} Pages
              </span>
            )}
            {document?.metadata?.chunkCount && (
              <span className="text-xs text-[#1F5E4B] font-medium">
                {document.metadata.chunkCount} Chunks Indexed
              </span>
            )}
            {analysis?.generatedAt && (
              <span className="text-xs text-[#8E9993]">
                Analyzed {new Date(analysis.generatedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReanalyze}
            disabled={analyzing || loading}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Re-Analyze
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#6B756F]">
            <Loader2 className="w-7 h-7 animate-spin text-[#1F5E4B]" />
            <p className="text-sm">Synthesizing source intelligence...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-[#FDEDEC] border border-[#F5C2C0] rounded-xl text-sm text-[#D32F2F] flex flex-col gap-2">
            <p className="font-semibold">Unable to load source analysis</p>
            <p className="text-xs">{error}</p>
            <Button size="sm" variant="outline" className="self-start mt-1" onClick={loadAnalysis}>
              Retry
            </Button>
          </div>
        )}

        {/* Loaded Analysis Content */}
        {!loading && !error && analysis && (
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E2E7E3] pb-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5
                  ${activeTab === 'overview'
                    ? 'bg-[#E8F2EE] text-[#1F5E4B]'
                    : 'text-[#6B756F] hover:bg-[#F2F5F3]'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Overview & Topics
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('concepts')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5
                  ${activeTab === 'concepts'
                    ? 'bg-[#E8F2EE] text-[#1F5E4B]'
                    : 'text-[#6B756F] hover:bg-[#F2F5F3]'}`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Concepts ({analysis.keyConcepts?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('takeaways')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5
                  ${activeTab === 'takeaways'
                    ? 'bg-[#E8F2EE] text-[#1F5E4B]'
                    : 'text-[#6B756F] hover:bg-[#F2F5F3]'}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Takeaways ({analysis.keyTakeaways?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5
                  ${activeTab === 'sections'
                    ? 'bg-[#E8F2EE] text-[#1F5E4B]'
                    : 'text-[#6B756F] hover:bg-[#F2F5F3]'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                Sections ({analysis.sections?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5
                  ${activeTab === 'questions'
                    ? 'bg-[#E8F2EE] text-[#1F5E4B]'
                    : 'text-[#6B756F] hover:bg-[#F2F5F3]'}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Suggested Questions ({analysis.suggestedQuestions?.length || 0})
              </button>
            </div>

            {/* Tab 1: Overview & Topics */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-4 text-[#17211D]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] mb-1.5">
                    Executive Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-[#2C3E35] bg-[#F7FAF8] p-3.5 rounded-xl border border-[#E2E7E3]">
                    {analysis.overview || 'No overview generated.'}
                  </p>
                </div>

                {analysis.keyTopics && analysis.keyTopics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] mb-2">
                      Key Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-[#E8F2EE] text-[#1F5E4B] text-xs font-medium rounded-md border border-[#D0E2DB]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Key Concepts & Definitions */}
            {activeTab === 'concepts' && (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {analysis.keyConcepts && analysis.keyConcepts.length > 0 ? (
                  analysis.keyConcepts.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-[#E2E7E3] rounded-xl flex flex-col gap-1 shadow-2xs"
                    >
                      <h5 className="text-xs font-bold text-[#1F5E4B]">{c.term}</h5>
                      <p className="text-xs text-[#2C3E35] leading-relaxed">{c.definition}</p>
                      {c.context && (
                        <p className="text-[11px] text-[#6B756F] italic mt-0.5">
                          Context: {c.context}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8E9993] py-6 text-center">
                    No specific definitions or concept terms extracted.
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Key Takeaways & Facts */}
            {activeTab === 'takeaways' && (
              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
                {analysis.keyTakeaways && analysis.keyTakeaways.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] mb-2">
                      Core Takeaways
                    </h4>
                    <ul className="space-y-2">
                      {analysis.keyTakeaways.map((t, i) => (
                        <li
                          key={i}
                          className="text-xs text-[#2C3E35] leading-relaxed flex items-start gap-2 bg-[#FAFBF9] p-2.5 rounded-lg border border-[#E2E7E3]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E4B] shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.importantFacts && analysis.importantFacts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] mb-2">
                      Important Facts & Metrics
                    </h4>
                    <ul className="space-y-1.5">
                      {analysis.importantFacts.map((f, i) => (
                        <li key={i} className="text-xs text-[#2C3E35] list-disc list-inside">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Sections / Document Structure */}
            {activeTab === 'sections' && (
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {analysis.sections && analysis.sections.length > 0 ? (
                  analysis.sections.map((sec, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-[#E2E7E3] rounded-xl flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#17211D]">{sec.title}</span>
                        {sec.pageStart && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#F2F5F3] text-[#6B756F] rounded">
                            {sec.pageEnd && sec.pageEnd !== sec.pageStart
                              ? `Pages ${sec.pageStart}-${sec.pageEnd}`
                              : `Page ${sec.pageStart}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B756F] leading-relaxed">{sec.summary}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8E9993] py-6 text-center">
                    No discrete sections found in document.
                  </p>
                )}
              </div>
            )}

            {/* Tab 5: Suggested Questions */}
            {activeTab === 'questions' && (
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0 ? (
                  analysis.suggestedQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#FAFBF9] border border-[#E2E7E3] hover:border-[#1F5E4B] hover:bg-[#F4F9F6] rounded-xl flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (onAskQuestion) {
                          onAskQuestion(q);
                          onClose();
                        }
                      }}
                    >
                      <span className="text-xs text-[#2C3E35] font-medium leading-relaxed">
                        {q}
                      </span>
                      <button
                        type="button"
                        className="px-2 py-1 bg-[#1F5E4B] text-white text-[11px] font-semibold rounded-md shrink-0 flex items-center gap-1 opacity-90 group-hover:opacity-100"
                      >
                        <Send className="w-2.5 h-2.5" />
                        Ask
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8E9993] py-6 text-center">
                    No suggested questions available.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
