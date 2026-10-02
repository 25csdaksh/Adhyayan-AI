import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Globe,
  FileText,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ResearchCitationCard } from './ResearchCitationCard';

export const ResearchResult = ({ result, onSelectCitation }) => {
  const [copied, setCopied] = useState(false);

  if (!result || !result.answer) return null;

  const { answer, citations = [], retrieval = {} } = result;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render text with clickable citation badges
  const renderFormattedText = (text) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        const citObj = citations.find((c) => c.citationNumber === citationNum);

        const isWeb = citObj?.sourceKind === 'web' || !!citObj?.webSourceId;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => citObj && onSelectCitation && onSelectCitation(citObj)}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer ${
              isWeb
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-[#E8EFEA] text-[#1F5E4B] border-[#C2D8CD] hover:bg-[#D8E9E2]'
            }`}
          >
            {isWeb ? <Globe className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
            {citationNum}
          </button>
        );
      }

      return (
        <span key={idx} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  const notebookCitationsCount = citations.filter((c) => c.sourceKind === 'notebook' || !c.webSourceId).length;
  const webCitationsCount = citations.filter((c) => c.sourceKind === 'web' || !!c.webSourceId).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Provenance Status Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E7E3] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="forest" size="sm">
            Scope: {retrieval.sourceScope?.toUpperCase() || 'COMBINED'}
          </Badge>

          {notebookCitationsCount > 0 && (
            <Badge variant="neutral" size="sm">
              <FileText className="w-3 h-3 mr-1 text-[#1F5E4B]" />
              {notebookCitationsCount} Notebook Source{notebookCitationsCount === 1 ? '' : 's'}
            </Badge>
          )}

          {webCitationsCount > 0 && (
            <Badge variant="blue" size="sm">
              <Globe className="w-3 h-3 mr-1 text-blue-600" />
              {webCitationsCount} Web Source{webCitationsCount === 1 ? '' : 's'}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#1F5E4B]" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? 'Copied' : 'Copy Synthesis'}
        </Button>
      </div>

      {/* Synthesis Content Card */}
      <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0F3F1]">
          <Sparkles className="w-4 h-4 text-[#1F5E4B]" />
          <h4 className="text-sm font-bold text-[#17211D]">
            Multi-Source Grounded Synthesis
          </h4>
        </div>

        <div className="text-sm text-[#17211D] leading-relaxed">
          {renderFormattedText(answer)}
        </div>
      </div>

      {/* Citations Grid */}
      {citations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#6B756F]">
              Grounded Research Provenance ({citations.length})
            </h5>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {citations.map((citation, idx) => (
              <ResearchCitationCard
                key={idx}
                citation={citation}
                onSelectCitation={onSelectCitation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
