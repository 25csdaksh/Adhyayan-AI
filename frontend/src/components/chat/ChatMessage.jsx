import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
} from 'lucide-react';
import { CitationCard } from './CitationCard';
import { useToast } from '../../context/ToastContext';
import { formatRelativeDate } from '../../utils/formatters';

export const ChatMessage = ({
  message,
  onRegenerate,
  onCitationClick,
}) => {
  const isAI = message.role === 'assistant' || message.sender === 'ai';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);
  const toast = useToast();

  const contentText = message.content || message.text || '';
  const citations = message.citations || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean Markdown rendering for structured academic responses
  const renderFormattedText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Header level 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm sm:text-base font-bold text-[#17211D] mt-3 mb-1.5 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header level 2
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold text-[#17211D] mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Bullet point
      if (line.startsWith('* ') || line.startsWith('• ') || line.startsWith('- ')) {
        const itemText = line.replace(/^[\*\•\-]\s*/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-[#17211D] leading-relaxed my-1">
            {renderBoldCodeAndCitations(itemText)}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const itemText = line.replace(/^\d+\.\s*/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-[#17211D] leading-relaxed my-1">
            {renderBoldCodeAndCitations(itemText)}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-[#17211D] leading-relaxed my-1">
          {renderBoldCodeAndCitations(line)}
        </p>
      );
    });
  };

  const renderBoldCodeAndCitations = (text) => {
    // Regex for bold (**bold**), inline code (`code`), and citation markers ([1], [2])
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`|\[\d+\])/g);

    return parts.map((part, i) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#17211D]">{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#F2F5F3] text-[#1F5E4B] border border-[#E2E7E3]">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Inline citation pill e.g. [1]
      const citMatch = part.match(/^\[(\d+)\]$/);
      if (citMatch && isAI) {
        const citNum = parseInt(citMatch[1], 10);
        const matchingCitation = citations.find((c) => (c.citationNumber || c.index) === citNum);

        return (
          <button
            key={i}
            type="button"
            onClick={() => onCitationClick?.(matchingCitation || { citationNumber: citNum })}
            className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 rounded bg-[#E8F2EE] hover:bg-[#1F5E4B] text-[#1F5E4B] hover:text-white font-mono text-[11px] font-bold border border-[#D8E9E2] transition-colors cursor-pointer align-baseline"
            title={`View Source [${citNum}]`}
          >
            {citNum}
          </button>
        );
      }

      return part;
    });
  };

  const timeLabel = message.createdAt
    ? formatRelativeDate(message.createdAt)
    : message.timestamp || 'Just now';

  return (
    <div className={`flex gap-3 sm:gap-4 py-4 px-3 sm:px-5 rounded-2xl transition-colors ${isAI ? 'bg-white border border-[#E2E7E3] shadow-2xs' : 'bg-transparent'}`}>
      {/* Avatar */}
      <div className="shrink-0">
        {isAI ? (
          <div className="w-8 h-8 rounded-xl bg-[#1F5E4B] text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] border border-[#D8E9E2] flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#17211D]">
              {isAI ? 'StudyLM AI' : 'You'}
            </span>
            {isAI && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F2EE] text-[#1F5E4B] border border-[#D8E9E2]">
                Grounded in Sources
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#8E9993] font-medium">{timeLabel}</span>
        </div>

        {/* Formatted Content */}
        <div className="text-xs sm:text-sm text-[#17211D] space-y-1">
          {renderFormattedText(contentText)}
        </div>

        {/* Citations Section */}
        {isAI && citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#EDF1EE]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F5E4B] mb-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grounded Citations ({citations.length})</span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {citations.map((cit, idx) => (
                <CitationCard
                  key={cit.chunkId || idx}
                  citation={cit}
                  index={cit.citationNumber || idx + 1}
                  onPreview={onCitationClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Toolbar for AI responses */}
        {isAI && (
          <div className="flex items-center justify-between pt-2 text-[#8E9993]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:text-[#17211D] hover:bg-[#F2F5F3] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:text-[#17211D] hover:bg-[#F2F5F3] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  title="Regenerate answer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Regenerate</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLiked(liked === 'up' ? null : 'up')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  liked === 'up' ? 'text-[#1F5E4B] bg-[#E8F2EE]' : 'hover:text-[#17211D] hover:bg-[#F2F5F3]'
                }`}
                title="Helpful response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLiked(liked === 'down' ? null : 'down')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  liked === 'down' ? 'text-rose-600 bg-rose-50' : 'hover:text-[#17211D] hover:bg-[#F2F5F3]'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
