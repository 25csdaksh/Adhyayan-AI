import React from 'react';
import {
  Globe,
  ExternalLink,
  RotateCw,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const WebSourceCard = ({
  webSource,
  onRefresh,
  onDelete,
  isRefreshing = false,
}) => {
  if (!webSource) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <Badge variant="forest" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="neutral" size="sm">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="accent" size="sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="p-3.5 bg-white rounded-xl border border-[#E2E7E3] hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-2.5 group text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <h5 className="text-xs font-bold text-[#17211D] truncate group-hover:text-blue-700 transition-colors">
              {webSource.title || webSource.domain || 'Web Source'}
            </h5>
            <p className="text-[11px] text-[#6B756F] truncate">
              {webSource.domain || webSource.url}
            </p>
          </div>
        </div>

        {getStatusBadge(webSource.status)}
      </div>

      {webSource.description && (
        <p className="text-[11px] text-[#6B756F] line-clamp-2 leading-relaxed">
          {webSource.description}
        </p>
      )}

      {webSource.error && (
        <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-1.5 rounded-lg border border-rose-100">
          {webSource.error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#F0F3F1] text-[10px] text-[#6B756F]">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {webSource.fetchedAt
            ? `Indexed ${new Date(webSource.fetchedAt).toLocaleDateString()}`
            : 'Pending'}
        </span>

        <div className="flex items-center gap-1">
          {webSource.url && (
            <a
              href={webSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-[#6B756F] hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Open website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => onRefresh && onRefresh(webSource._id)}
            className="p-1 text-[#6B756F] hover:text-[#1F5E4B] rounded hover:bg-[#E8EFEA] transition-colors cursor-pointer"
            title="Refresh web source"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(webSource._id)}
            className="p-1 text-[#6B756F] hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete web source"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
