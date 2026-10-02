import React, { useState } from 'react';
import {
  FileText,
  Layers,
  HelpCircle,
  GitFork,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const StudyToolHistory = ({
  studyTools = [],
  activeToolId = null,
  onSelectTool,
  onDeleteTool,
  isLoading = false,
}) => {
  const [filterType, setFilterType] = useState('all');

  const getToolMeta = (toolType) => {
    switch (toolType) {
      case 'summary':
        return {
          label: 'Summary',
          icon: FileText,
          badgeVariant: 'forest',
        };
      case 'flashcards':
        return {
          label: 'Flashcards',
          icon: Layers,
          badgeVariant: 'blue',
        };
      case 'quiz':
        return {
          label: 'Quiz',
          icon: HelpCircle,
          badgeVariant: 'accent',
        };
      case 'mindmap':
        return {
          label: 'Mind Map',
          icon: GitFork,
          badgeVariant: 'emerald',
        };
      default:
        return {
          label: 'Study Material',
          icon: Sparkles,
          badgeVariant: 'neutral',
        };
    }
  };

  const filteredTools = studyTools.filter((tool) => {
    if (filterType === 'all') return true;
    return tool.toolType === filterType;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#E2E7E3]">
        {['all', 'summary', 'flashcards', 'quiz', 'mindmap'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
              filterType === type
                ? 'bg-[#1F5E4B] text-white shadow-2xs'
                : 'text-[#6B756F] hover:bg-[#FAFBF9] hover:text-[#17211D]'
            }`}
          >
            {type === 'all' ? 'All History' : type}
          </button>
        ))}
      </div>

      {/* History Cards List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-[#6B756F]">
          Loading generated study materials...
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="p-8 text-center bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] space-y-2">
          <Sparkles className="w-6 h-6 text-[#6B756F] mx-auto opacity-50" />
          <p className="text-xs font-semibold text-[#17211D]">
            No study materials found
          </p>
          <p className="text-[11px] text-[#6B756F]">
            Generate summaries, flashcards, quizzes, or mind maps to save them here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTools.map((tool) => {
            const meta = getToolMeta(tool.toolType);
            const Icon = meta.icon;
            const isSelected = activeToolId === tool._id;

            return (
              <div
                key={tool._id}
                onClick={() => onSelectTool(tool)}
                className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'border-[#1F5E4B] bg-[#E8EFEA]/40 ring-1 ring-[#1F5E4B]'
                    : 'border-[#E2E7E3] bg-white hover:border-[#1F5E4B] hover:bg-[#FAFBF9]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-[#17211D] truncate group-hover:text-[#1F5E4B]">
                        {tool.title || meta.label}
                      </h5>
                      <Badge variant={meta.badgeVariant} size="sm">
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B756F]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(tool.createdAt).toLocaleDateString()}
                      </span>
                      {tool.citations?.length > 0 && (
                        <span>• {tool.citations.length} Citations</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTool(tool._id);
                    }}
                    aria-label="Delete Study Tool"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-[#6B756F] group-hover:text-[#1F5E4B] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
