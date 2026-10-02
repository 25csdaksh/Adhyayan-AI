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

  return (
    <Card hoverable className="group relative flex flex-col justify-between overflow-hidden border-[#E2E7E3] hover:border-[#BAC5C0]">
      {/* Top Bar with Icon & Actions */}
      <div className="p-5 sm:p-6 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#D8E9E2] bg-[#E8F2EE] text-[#1F5E4B] shadow-2xs transition-transform duration-200 group-hover:scale-105">
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="p-1.5 text-[#8E9993] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
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
          <h3 className="text-base font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors leading-snug line-clamp-1">
            {notebook.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B756F] mt-1.5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {notebook.description || 'No description provided.'}
          </p>
        </Link>
      </div>

      {/* Card Footer Meta */}
      <div className="px-5 sm:px-6 py-3.5 mt-4 bg-[#FAFBF9] border-t border-[#EDF1EE] flex items-center justify-between text-xs text-[#6B756F]">
        <div className="flex items-center gap-1.5 font-medium">
          <FileText className="w-3.5 h-3.5 text-[#1F5E4B]" />
          <span>0 sources</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#8E9993]" />
          <span>{formatUpdatedTime(notebook.updatedAt || notebook.lastUpdated)}</span>
        </div>
      </div>
    </Card>
  );
};
