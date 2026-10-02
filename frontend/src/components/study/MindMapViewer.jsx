import React, { useState } from 'react';
import {
  GitFork,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  Maximize2,
  Minimize2,
  BookOpen,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CitationCard } from '../chat/CitationCard';

const MindMapNode = ({ node, depth = 0, onSelectCitation }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  const depthColors = [
    'border-[#1F5E4B] bg-[#E8EFEA] text-[#1F5E4B]',
    'border-emerald-300 bg-emerald-50/70 text-emerald-800',
    'border-teal-200 bg-teal-50/50 text-teal-800',
    'border-slate-200 bg-[#FAFBF9] text-[#17211D]',
    'border-gray-200 bg-white text-[#3D4741]',
  ];

  const colorClass = depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 group">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-5 h-5 rounded-md hover:bg-[#E2E7E3] text-[#6B756F] flex items-center justify-center transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6B756F]" />
          </div>
        )}

        <div
          className={`px-3 py-2 rounded-xl border text-sm font-medium shadow-2xs transition-all flex items-center gap-2 ${colorClass}`}
        >
          <span>{node.title}</span>
          {hasChildren && (
            <span className="text-[10px] font-bold opacity-75 px-1.5 py-0.5 rounded-full bg-black/5">
              {node.children.length}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-6 border-l-2 border-[#E2E7E3] ml-2.5 space-y-2.5 pt-1">
          {node.children.map((child, idx) => (
            <MindMapNode
              key={idx}
              node={child}
              depth={depth + 1}
              onSelectCitation={onSelectCitation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MindMapViewer = ({ studyTool, onSelectCitation }) => {
  const root = studyTool?.result?.root;
  const citations = studyTool?.citations || [];

  if (!root) {
    return (
      <div className="p-8 text-center text-[#6B756F]">
        No mind map hierarchy available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E7E3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#17211D]">
              {studyTool.title || 'Knowledge Mind Map'}
            </h3>
            <Badge variant="forest" size="sm">
              Hierarchical Tree
            </Badge>
          </div>
          <p className="text-xs text-[#6B756F]">
            Interactive concept taxonomy and knowledge hierarchy grounded in notebook sources
          </p>
        </div>
      </div>

      {/* Tree Visualization Container */}
      <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] shadow-sm overflow-x-auto min-h-[300px]">
        <MindMapNode
          node={root}
          depth={0}
          onSelectCitation={onSelectCitation}
        />
      </div>

      {/* Citations Footer */}
      {citations.length > 0 && (
        <div className="pt-4 border-t border-[#E2E7E3] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F]">
            Grounded Citations ({citations.length})
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {citations.map((citation, idx) => (
              <CitationCard
                key={idx}
                citation={citation}
                onSelectCitation={onSelectCitation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
