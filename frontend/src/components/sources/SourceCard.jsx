import React from 'react';
import {
  FileText,
  Globe,
  FileType,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';

export const SourceCard = ({
  source,
  onRemove,
  onViewSnippet,
  isSelected = false,
  onSelect,
}) => {
  const getTypeIcon = () => {
    switch (source.type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'docx':
        return <FileType className="w-4 h-4 text-blue-600" />;
      case 'web':
        return <Globe className="w-4 h-4 text-emerald-600" />;
      case 'txt':
      default:
        return <FileText className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTypeBg = () => {
    switch (source.type) {
      case 'pdf':
        return 'bg-rose-50 border-rose-100';
      case 'docx':
        return 'bg-blue-50 border-blue-100';
      case 'web':
        return 'bg-emerald-50 border-emerald-100';
      case 'txt':
      default:
        return 'bg-amber-50 border-amber-100';
    }
  };

  const renderStatus = () => {
    switch (source.status) {
      case 'ready':
        return <span className="text-[11px] text-[#6B756F]">{source.pages ? `${source.pages} pgs` : source.size}</span>;
      case 'processing':
        return (
          <Badge variant="amber" size="sm" dot>
            <Loader2 className="w-3 h-3 animate-spin inline-block -mt-0.5 mr-1" />
            Indexing
          </Badge>
        );
      case 'uploading':
        return (
          <Badge variant="blue" size="sm" dot>
            Uploading
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="rose" size="sm" dot>
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer select-none
        ${isSelected
          ? 'bg-[#E8F2EE] border-[#1F5E4B] shadow-2xs'
          : 'bg-white border-[#E2E7E3] hover:border-[#BAC5C0] hover:bg-[#FAFBF9]'}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${getTypeBg()}`}>
          {getTypeIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#17211D] truncate group-hover:text-[#1F5E4B] transition-colors" title={source.title}>
            {source.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-mono text-[#8E9993] uppercase">{source.type}</span>
            <span className="text-[11px] text-[#8E9993]">•</span>
            {renderStatus()}
          </div>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Dropdown
          trigger={
            <button
              type="button"
              className="p-1 text-[#8E9993] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-md transition-colors cursor-pointer"
              aria-label="Source options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          }
        >
          {source.snippet && (
            <DropdownItem icon={Eye} onClick={() => onViewSnippet?.(source)}>
              View Summary
            </DropdownItem>
          )}
          {source.type === 'web' && (
            <DropdownItem icon={ExternalLink} onClick={() => window.open(source.title, '_blank')}>
              Open URL
            </DropdownItem>
          )}
          <DropdownItem icon={RefreshCw}>
            Re-index Source
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={Trash2} danger onClick={() => onRemove?.(source.id)}>
            Remove Source
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};
