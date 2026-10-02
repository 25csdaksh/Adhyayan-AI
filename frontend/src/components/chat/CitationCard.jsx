import React, { useState } from 'react';
import { FileText, Globe, AlignLeft, Quote, ChevronRight } from 'lucide-react';

export const CitationCard = ({
  citation,
  index,
  onPreview,
}) => {
  const [expanded, setExpanded] = useState(false);

  const title = citation.documentTitle || citation.sourceTitle || 'Document Source';
  const num = citation.citationNumber || index || 1;

  let pageLabel = null;
  if (citation.pageNumber) {
    pageLabel = `p.${citation.pageNumber}`;
  } else if (citation.pageStart && citation.pageEnd && citation.pageStart !== citation.pageEnd) {
    pageLabel = `pp.${citation.pageStart}-${citation.pageEnd}`;
  } else if (citation.pageStart) {
    pageLabel = `p.${citation.pageStart}`;
  } else if (citation.page) {
    pageLabel = `p.${citation.page}`;
  } else if (citation.sourceType === 'url' || citation.sourceType === 'web') {
    pageLabel = 'Web';
  } else if (citation.sourceType === 'text') {
    pageLabel = 'Note';
  }

  const getSourceIcon = () => {
    if (citation.sourceType === 'url' || citation.sourceType === 'web') {
      return <Globe className="w-3 h-3 shrink-0 text-emerald-600" />;
    }
    if (citation.sourceType === 'text') {
      return <AlignLeft className="w-3 h-3 shrink-0 text-purple-600" />;
    }
    return <FileText className="w-3 h-3 shrink-0 text-[#1F5E4B]" />;
  };

  const handleClick = (e) => {
    if (onPreview) {
      onPreview(citation);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="inline-flex flex-col my-1 mr-1.5 align-middle group cursor-pointer relative">
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-150 select-none cursor-pointer
          ${expanded
            ? 'bg-[#1F5E4B] text-white border-[#1F5E4B] shadow-2xs'
            : 'bg-[#FAFBF9] text-[#1F5E4B] border-[#D8E9E2] hover:bg-[#E8F2EE] hover:border-[#1F5E4B]'}`}
      >
        <span className="w-4 h-4 rounded-full bg-[#1F5E4B]/15 text-[#1F5E4B] group-hover:bg-[#1F5E4B] group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors">
          {num}
        </span>
        {getSourceIcon()}
        <span className="max-w-[140px] sm:max-w-[200px] truncate font-semibold">
          {title}
        </span>
        {pageLabel && (
          <span className="text-[10px] opacity-80 font-mono">{pageLabel}</span>
        )}
      </button>

      {expanded && citation.snippet && !onPreview && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-3 bg-white border border-[#D8E9E2] rounded-xl shadow-md text-xs text-[#17211D] max-w-sm animate-in fade-in zoom-in-95 z-20"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F5E4B] mb-1">
            <Quote className="w-3 h-3" /> Grounded Source Excerpt:
          </div>
          <p className="text-[#6B756F] italic leading-relaxed border-l-2 border-[#1F5E4B] pl-2 my-1.5">
            "{citation.snippet}"
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8E9993] pt-1.5 border-t border-[#EDF1EE]">
            <span>{title} {pageLabel ? `• ${pageLabel}` : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};
