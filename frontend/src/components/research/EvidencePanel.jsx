import React, { useState } from 'react';
import { Layers, FileText, Globe, Quote, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const EvidencePanel = ({ evidence = [], onSelectCitation }) => {
  const [expanded, setExpanded] = useState(false);

  if (!evidence || evidence.length === 0) return null;

  const displayItems = expanded ? evidence : evidence.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#EDF1EE]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#17211D]">Validated Source Evidence</span>
        </div>
        <Badge variant="blue" size="sm">
          {evidence.length} Excerpts
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayItems.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectCitation && onSelectCitation({
              chunkId: item.chunkId || item.id,
              documentId: item.documentId || item.sourceId,
              documentTitle: item.sourceTitle,
              sourceType: item.sourceType,
              sourceKind: item.sourceKind,
              snippet: item.text,
              pageNumber: item.pageNumber,
              url: item.url,
              domain: item.domain,
            })}
            className="p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF1EE] hover:border-[#1F5E4B] hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.sourceKind === 'web' || item.url ? (
                    <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#1F5E4B] shrink-0" />
                  )}
                  <span className="text-xs font-bold text-[#17211D] truncate group-hover:text-[#1F5E4B]">
                    {item.sourceTitle}
                  </span>
                </div>
                <Badge variant={item.sourceKind === 'web' ? 'blue' : 'forest'} size="sm">
                  {item.pageNumber ? `p.${item.pageNumber}` : item.sourceKind === 'web' ? 'Web' : 'Doc'}
                </Badge>
              </div>

              <p className="text-[11px] text-[#4F5B54] line-clamp-3 leading-relaxed italic bg-white p-2 rounded-lg border border-[#E2E7E3]">
                "{item.text}"
              </p>
            </div>

            <div className="text-[10px] font-semibold text-[#8E9993] flex items-center justify-between pt-1 border-t border-[#EDF1EE]">
              <span>Score: {(item.score * 100).toFixed(0)}%</span>
              <span className="text-[#1F5E4B] group-hover:underline flex items-center gap-0.5">
                Preview <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {evidence.length > 4 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1.5 text-center text-xs font-semibold text-[#1F5E4B] hover:bg-[#E8F2EE] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>View All {evidence.length} Evidence Excerpts</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
