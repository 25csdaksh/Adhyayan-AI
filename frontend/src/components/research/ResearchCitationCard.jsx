import React from 'react';
import {
  FileText,
  Globe,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ResearchCitationCard = ({ citation, onSelectCitation }) => {
  if (!citation) return null;

  const isWeb = citation.sourceKind === 'web' || !!citation.webSourceId || !!citation.url;

  return (
    <div
      onClick={() => onSelectCitation && onSelectCitation(citation)}
      className="p-3 bg-white rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between group space-y-2 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isWeb ? 'bg-blue-50 text-blue-700' : 'bg-[#E8EFEA] text-[#1F5E4B]'
            }`}
          >
            {isWeb ? <Globe className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          </div>

          <span className="text-xs font-bold text-[#17211D] truncate group-hover:text-[#1F5E4B] transition-colors">
            {citation.documentTitle || (isWeb ? citation.domain : 'Notebook Source')}
          </span>
        </div>

        <Badge variant={isWeb ? 'blue' : 'forest'} size="sm">
          {isWeb ? (citation.domain || 'Web') : 'Notebook'}
        </Badge>
      </div>

      {citation.snippet && (
        <p className="text-[11px] text-[#6B756F] line-clamp-2 leading-relaxed italic bg-[#FAFBF9] p-1.5 rounded-lg border border-[#F0F3F1]">
          "{citation.snippet}"
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-[#6B756F] pt-1 border-t border-[#F0F3F1]">
        <span className="font-semibold text-[#1F5E4B]">
          [{citation.citationNumber || 1}]
        </span>

        {isWeb && citation.url ? (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 text-blue-600 hover:underline font-medium"
          >
            Visit Website <ArrowUpRight className="w-3 h-3" />
          </a>
        ) : (
          <span>
            {citation.pageNumber ? `Page ${citation.pageNumber}` : 'Document Excerpt'}
          </span>
        )}
      </div>
    </div>
  );
};
