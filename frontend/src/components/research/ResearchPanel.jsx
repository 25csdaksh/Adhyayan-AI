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
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { executeResearch } from '../../api/researchService';
import { ResearchResult } from './ResearchResult';

export const ResearchPanel = ({ notebookId, onSelectCitation }) => {
  const [query, setQuery] = useState('');
  const [sourceScope, setSourceScope] = useState('all'); // 'notebook' | 'web' | 'all'
  const [isSearching, setIsSearching] = useState(false);
  const [researchData, setResearchData] = useState(null);

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
      const data = await executeResearch(notebookId, {
        query: targetQuery.trim(),
        sourceScope,
        topK: 10,
      });

      setResearchData(data);
      toast.success('Research synthesis completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Research synthesis failed');
    } finally {
      setIsSearching(false);
    }
  };

  const exampleQueries = [
    'Explain the core fault-tolerance thresholds and error recovery mechanisms',
    'Compare classical computing limitations with quantum circuit scaling',
    'Summarize real-world industry implementations of this architecture',
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E7E3]">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1F5E4B]" />
            Deep Research Assistant
          </h3>
          <p className="text-[11px] text-[#6B756F]">
            Cross-reference notebook sources with verified web intelligence
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1F5E4B] bg-[#E8EFEA] px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          SSRF & Anti-Injection Guarded
        </div>
      </div>

      {/* Query Formulation Card */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-4">
        {/* Scope Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B756F]">
            Select Evidence Scope:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSourceScope('notebook')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                sourceScope === 'notebook'
                  ? 'border-[#1F5E4B] bg-[#E8EFEA] text-[#1F5E4B] shadow-2xs'
                  : 'border-[#E2E7E3] bg-[#FAFBF9] text-[#6B756F] hover:bg-white hover:text-[#17211D]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notebook Only</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceScope('web')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                sourceScope === 'web'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                  : 'border-[#E2E7E3] bg-[#FAFBF9] text-[#6B756F] hover:bg-white hover:text-[#17211D]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Web Sources</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceScope('all')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                sourceScope === 'all'
                  ? 'border-[#1F5E4B] bg-[#E8EFEA] text-[#1F5E4B] shadow-2xs'
                  : 'border-[#E2E7E3] bg-[#FAFBF9] text-[#6B756F] hover:bg-white hover:text-[#17211D]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Combined (All)</span>
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B756F]">
            Research Question / Query:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunResearch();
                }
              }}
              placeholder="Formulate an in-depth academic inquiry (e.g. Compare surface code error thresholds with Steane code principles)..."
              className="w-full p-3 text-xs rounded-xl border border-[#E2E7E3] focus:outline-none focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B] resize-none text-[#17211D]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#6B756F]">
            Press Enter ↵ to synthesize
          </span>

          <Button
            variant="primary"
            size="md"
            disabled={isSearching || !query.trim()}
            onClick={() => handleRunResearch()}
            leftIcon={isSearching ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isSearching ? 'Gathering & Synthesizing Sources...' : 'Synthesize Research'}
          </Button>
        </div>
      </div>

      {/* Research Output View */}
      {researchData ? (
        <ResearchResult
          result={researchData}
          onSelectCitation={onSelectCitation}
        />
      ) : (
        /* Empty State / Suggestions */
        <div className="p-6 bg-[#FAFBF9] rounded-2xl border border-[#E2E7E3] space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#17211D] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" />
              Suggested Inquiries for this Notebook
            </h4>
            <p className="text-[11px] text-[#6B756F]">
              Click any suggestion to immediately trigger a multi-source research report
            </p>
          </div>

          <div className="space-y-2">
            {exampleQueries.map((exQuery, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(exQuery);
                  handleRunResearch(exQuery);
                }}
                className="w-full p-3 rounded-xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B] text-left text-xs font-medium text-[#17211D] transition-all flex items-center justify-between gap-3 shadow-2xs group cursor-pointer"
              >
                <span>"{exQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B756F] group-hover:text-[#1F5E4B] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
