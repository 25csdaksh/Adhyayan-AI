import React from 'react';
import {
  FileText,
  Globe,
  FileType,
  AlignLeft,
  Loader2,
  Trash2,
  ExternalLink,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { formatBytes, formatRelativeDate } from '../../utils/formatters';

export const SourceCard = ({
  source,
  onRemove,
  onReprocess,
  onViewDetails,
  isSelected = false,
  onSelect,
}) => {
  const type = source.sourceType || source.type || 'txt';

  const getTypeConfig = () => {
    switch (type) {
      case 'pdf':
        return {
          icon: <FileText className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 border-rose-100',
          label: 'PDF',
        };
      case 'docx':
        return {
          icon: <FileType className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-100',
          label: 'Word Document',
        };
      case 'url':
      case 'web':
        return {
          icon: <Globe className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
          label: 'Web Page',
        };
      case 'text':
        return {
          icon: <AlignLeft className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-100',
          label: 'Plain Text',
        };
      case 'txt':
      default:
        return {
          icon: <FileText className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-100',
          label: 'Text File',
        };
    }
  };

  const { icon, bg, label } = getTypeConfig();

  const renderStatus = () => {
    switch (source.status) {
      case 'ready':
        if (source.analysis?.status === 'ready') {
          return (
            <Badge variant="forest" size="sm" dot>
              Analyzed
            </Badge>
          );
        }
        return (
          <Badge variant="forest" size="sm" dot>
            Ready
          </Badge>
        );
      case 'processing':
        if (source.metadata?.embeddingStatus === 'in_progress') {
          return (
            <Badge variant="purple" size="sm" dot>
              <Loader2 className="w-3 h-3 animate-spin inline-block -mt-0.5 mr-1" />
              Embedding
            </Badge>
          );
        }
        return (
          <Badge variant="amber" size="sm" dot>
            <Loader2 className="w-3 h-3 animate-spin inline-block -mt-0.5 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="rose" size="sm" dot>
            <AlertCircle className="w-3 h-3 inline-block -mt-0.5 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="neutral" size="sm" dot>
            <Clock className="w-2.5 h-2.5 inline-block -mt-0.5 mr-1 text-[#8E9993]" />
            Pending
          </Badge>
        );
    }
  };

  const formattedSize = source.fileSize ? formatBytes(source.fileSize) : source.size || null;
  const relativeDate = formatRelativeDate(source.createdAt);
  const metadata = source.metadata || {};

  return (
    <div
      onClick={onSelect}
      className={`group p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 cursor-pointer select-none
        ${isSelected
          ? 'bg-[#E8F2EE]/80 border-[#1F5E4B] shadow-sm'
          : 'bg-white border-[#E2E7E3] hover:border-[#BAC5C0] hover:shadow-xs hover:bg-[#FAFBF9]'}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${bg}`}>
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-bold text-[#17211D] leading-snug line-clamp-2 group-hover:text-[#1F5E4B] transition-colors"
              title={source.title}
            >
              {source.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px] text-[#6B756F]">
              <span className="font-semibold text-[#17211D] bg-[#F2F5F3] px-1.5 py-0.5 rounded text-[10px]">{label}</span>
              {metadata.pageCount && (
                <span className="text-[10px] bg-[#F7F8F6] border border-[#E2E7E3] px-1.5 py-0.5 rounded font-medium text-[#4A5550]">
                  {metadata.pageCount} pgs
                </span>
              )}
              {metadata.chunkCount !== undefined && metadata.chunkCount > 0 && (
                <span className="text-[10px] bg-[#E8F2EE] border border-[#D8E9E2] px-1.5 py-0.5 rounded font-medium text-[#1F5E4B]">
                  {metadata.chunkCount} chunks
                </span>
              )}
              {formattedSize && (
                <span className="text-[10px] text-[#8E9993] font-medium">{formattedSize}</span>
              )}
            </div>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-1">
          {source.status === 'ready' && onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(source)}
              className="p-1.5 text-[#6B756F] hover:text-[#1F5E4B] hover:bg-[#E8F2EE] rounded-lg transition-colors cursor-pointer"
              title="View Summary & Intelligence"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          <Dropdown
            trigger={
              <button
                type="button"
                className="p-1.5 text-[#8E9993] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
                aria-label="Source options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
          >
            {source.status === 'ready' && onViewDetails && (
              <DropdownItem
                icon={BookOpen}
                onClick={() => onViewDetails(source)}
              >
                View Source Summary
              </DropdownItem>
            )}
            {(source.status === 'failed' || source.status === 'ready') && onReprocess && (
              <DropdownItem
                icon={RefreshCw}
                onClick={() => onReprocess(source)}
              >
                Re-process Source
              </DropdownItem>
            )}
            {source.sourceUrl && (
              <DropdownItem
                icon={ExternalLink}
                onClick={() => window.open(source.sourceUrl, '_blank', 'noopener,noreferrer')}
              >
                Open Link
              </DropdownItem>
            )}
            {source.storageUrl && (
              <DropdownItem
                icon={ExternalLink}
                onClick={() => window.open(source.storageUrl, '_blank', 'noopener,noreferrer')}
              >
                View File
              </DropdownItem>
            )}
            <DropdownDivider />
            <DropdownItem
              icon={Trash2}
              danger
              onClick={() => onRemove?.(source)}
            >
              Remove Source
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Show safe processing error message if failed */}
      {source.status === 'failed' && source.processingError && (
        <div className="mt-1 p-2 bg-[#FDEDEC] border border-[#F5C2C0] rounded-lg text-[11px] text-[#D32F2F] flex items-center justify-between gap-2">
          <span className="truncate">{source.processingError}</span>
          {onReprocess && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReprocess(source);
              }}
              className="text-[#1F5E4B] font-semibold underline shrink-0 hover:text-[#174638]"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
