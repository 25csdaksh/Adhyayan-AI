import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Quote,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import { researchSessionService } from '../../api/researchSessionService';

export const ResearchReportViewer = ({
  session,
  notebookId,
  onSelectCitation,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!session) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.finalAnswer || '');
    setCopied(true);
    toast.success('Research report copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format = 'markdown') => {
    if (!notebookId || !session._id) return;
    setExporting(true);
    try {
      const res = await researchSessionService.exportResearchSession(notebookId, session._id, { format });
      if (res?.data) {
        const { filename, content } = res.data;
        const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `research-report.${format === 'markdown' ? 'md' : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Exported report as ${format.toUpperCase()}`);
      }
    } catch (err) {
      toast.error('Failed to export research report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Report Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E7E3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#17211D]">
              {session.title || 'Research Synthesis'}
            </h3>
            <Badge variant="forest" size="sm">
              {session.researchIntent?.category?.toUpperCase() || 'SYNTHESIS'}
            </Badge>
          </div>
          <p className="text-xs text-[#6B756F]">
            Original Query: "{session.originalQuestion}"
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={Download}
            disabled={exporting}
            onClick={() => handleExport('markdown')}
          >
            Export .MD
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={Download}
            disabled={exporting}
            onClick={() => handleExport('text')}
          >
            .TXT
          </Button>
        </div>
      </div>

      {/* Synthesis Executive Summary Card */}
      {session.synthesis?.executiveSummary && (
        <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#D8E9E2] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F5E4B]">
            <Sparkles className="w-4 h-4 text-[#1F5E4B]" /> Executive Summary
          </div>
          <p className="text-xs sm:text-sm text-[#17211D] leading-relaxed">
            {session.synthesis.executiveSummary}
          </p>
        </div>
      )}

      {/* Key Findings */}
      {session.synthesis?.keyFindings && session.synthesis.keyFindings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#17211D] uppercase tracking-wider">
            Key Evidenced Findings
          </h4>
          <div className="space-y-1.5">
            {session.synthesis.keyFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#4F5B54]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E4B] mt-1.5 shrink-0" />
                <span className="leading-relaxed">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Analysis Section */}
      {session.synthesis?.detailedAnalysis && (
        <div className="space-y-2 pt-2 border-t border-[#EDF1EE]">
          <h4 className="text-xs font-bold text-[#17211D] uppercase tracking-wider">
            Detailed Cross-Source Synthesis
          </h4>
          <div className="text-xs sm:text-sm text-[#17211D] leading-relaxed whitespace-pre-line space-y-3 font-normal">
            {session.synthesis.detailedAnalysis}
          </div>
        </div>
      )}

      {/* Comparison Section (if available) */}
      {session.synthesis?.crossSourceComparison && (
        <div className="space-y-2 pt-2 border-t border-[#EDF1EE]">
          <h4 className="text-xs font-bold text-[#17211D] uppercase tracking-wider">
            Cross-Source Comparison
          </h4>
          <p className="text-xs sm:text-sm text-[#4F5B54] leading-relaxed bg-[#FAFBF9] p-3 rounded-xl border border-[#EDF1EE]">
            {session.synthesis.crossSourceComparison}
          </p>
        </div>
      )}

      {/* Grounded Citations Bar */}
      {session.citations && session.citations.length > 0 && (
        <div className="pt-3 border-t border-[#E2E7E3] space-y-2">
          <h4 className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#1F5E4B]" />
            Grounded Source Citations ({session.citations.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {session.citations.map((cit, cIdx) => (
              <button
                key={cIdx}
                type="button"
                onClick={() => onSelectCitation && onSelectCitation(cit)}
                className="px-2.5 py-1 rounded-lg border border-[#E2E7E3] hover:border-[#1F5E4B] bg-[#FAFBF9] hover:bg-white text-xs font-semibold text-[#17211D] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
              >
                <span className="w-4 h-4 rounded-full bg-[#1F5E4B] text-white text-[9px] font-bold flex items-center justify-center">
                  {cit.citationNumber || cIdx + 1}
                </span>
                <span className="max-w-[140px] truncate group-hover:text-[#1F5E4B]">
                  {cit.documentTitle || 'Source'}
                </span>
                {cit.pageNumber && <span className="text-[10px] text-[#8E9993]">p.{cit.pageNumber}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
