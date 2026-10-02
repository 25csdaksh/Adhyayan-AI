import React, { useState } from 'react';
import { FileText, ExternalLink, Quote, ChevronRight } from 'lucide-react';

export const CitationCard = ({
  citation,
  index,
  onClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="inline-flex flex-col my-1 mr-1.5 align-middle group cursor-pointer"
    >
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-150 select-none
          ${expanded
            ? 'bg-[#1F5E4B] text-white border-[#1F5E4B] shadow-2xs'
            : 'bg-[#FAFBF9] text-[#1F5E4B] border-[#D8E9E2] hover:bg-[#E8F2EE] hover:border-[#1F5E4B]'}`}
      >
        <span className="w-4 h-4 rounded-full bg-[#1F5E4B]/15 text-[#1F5E4B] group-hover:bg-[#1F5E4B] group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors">
          {index || 1}
        </span>
        <FileText className="w-3 h-3 shrink-0 opacity-80" />
        <span className="max-w-[150px] sm:max-w-[200px] truncate font-semibold">
          {citation.sourceTitle}
        </span>
        {citation.page && (
          <span className="text-[11px] opacity-75 font-mono">p.{citation.page}</span>
        )}
      </div>

      {expanded && citation.snippet && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-3 bg-white border border-[#D8E9E2] rounded-xl shadow-md text-xs text-[#17211D] max-w-sm animate-in fade-in zoom-in-95 z-10"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F5E4B] mb-1">
            <Quote className="w-3 h-3" /> Grounded Source Excerpt:
          </div>
          <p className="text-[#6B756F] italic leading-relaxed border-l-2 border-[#1F5E4B] pl-2 my-1.5">
            "{citation.snippet}"
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8E9993] pt-1.5 border-t border-[#EDF1EE]">
            <span>{citation.sourceTitle} {citation.page ? `• Page ${citation.page}` : ''}</span>
            <span className="text-[#1F5E4B] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
              View Source <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
