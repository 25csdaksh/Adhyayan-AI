import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  MoreVertical,
  Clock,
  ExternalLink,
  Trash2,
  Edit2,
  Share2,
  Network,
  Binary,
  Database,
  Sparkles,
  Cpu,
  Sigma,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';

export const NotebookCard = ({
  notebook,
  onDelete,
  onEdit,
}) => {
  const notebookId = notebook._id || notebook.id;

  const iconMap = {
    Network,
    Binary,
    Database,
    Sparkles,
    Cpu,
    Sigma,
    BookOpen,
    book: BookOpen,
  };

  const Icon = iconMap[notebook.icon] || BookOpen;

  const formatUpdatedTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const diffSecs = Math.floor((new Date() - date) / 1000);
    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sourceCount = notebook.sourcesCount ?? notebook.sourceCount ?? (notebook.sources?.length) ?? 0;

  return (
    <Card hoverable className="group relative flex flex-col justify-between overflow-hidden border-slate-200/80 bg-white hover:border-emerald-600/40 hover:shadow-md transition-all duration-200">
      {/* Top Bar with Icon & Actions */}
      <div className="p-5 sm:p-6 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-800 shadow-2xs transition-transform duration-200 group-hover:scale-105">
            <Icon className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Notebook options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
            >
              <DropdownItem icon={ExternalLink}>
                <Link to={`/notebooks/${notebookId}`} className="w-full">
                  Open Workspace
                </Link>
              </DropdownItem>
              <DropdownItem icon={Edit2} onClick={() => onEdit?.(notebook)}>
                Rename &amp; Edit
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => onDelete?.(notebook)}>
                Delete Notebook
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Title & Description */}
        <Link to={`/notebooks/${notebookId}`} className="block mt-4 focus:outline-none">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-1">
            {notebook.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {notebook.description || 'Grounded workspace for documents, research papers, and study materials.'}
          </p>
        </Link>
      </div>

      {/* Card Footer Meta */}
      <div className="px-5 sm:px-6 py-3.5 mt-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatUpdatedTime(notebook.updatedAt || notebook.lastUpdated)}</span>
        </div>
      </div>
    </Card>
  );
};
