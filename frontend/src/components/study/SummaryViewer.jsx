import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CitationCard } from '../chat/CitationCard';

export const SummaryViewer = ({ studyTool, onSelectCitation }) => {
  const [copied, setCopied] = useState(false);

  if (!studyTool || !studyTool.result) {
    return null;
  }

  const { result, citations = [], title, createdAt } = studyTool;
  const { overview, keyPoints = [], concepts = [], mode } = result;

  const handleCopy = async () => {
    const textToCopy = `
# ${title || 'Notebook Summary'}

## Overview
${overview}

## Key Takeaways
${keyPoints.map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}

## Important Concepts
${concepts.map((c) => `- **${c.term}**: ${c.definition}`).join('\n')}
    `.trim();

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E7E3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#17211D]">
              {title || 'Notebook Summary'}
            </h3>
            <Badge variant={mode === 'short' ? 'neutral' : 'forest'} size="sm">
              {mode === 'short' ? 'Concise Summary' : 'Detailed Summary'}
            </Badge>
          </div>
          <p className="text-xs text-[#6B756F]">
            Grounded in {citations.length} source reference{citations.length === 1 ? '' : 's'} •{' '}
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#1F5E4B]" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? 'Copied' : 'Copy Summary'}
        </Button>
      </div>

      {/* Overview Section */}
      <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#1F5E4B]" />
          Executive Overview
        </h4>
        <p className="text-sm text-[#17211D] leading-relaxed whitespace-pre-wrap">
          {overview}
        </p>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" />
            Key Takeaways & Core Principles
          </h4>
          <div className="grid gap-2.5">
            {keyPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#E2E7E3] shadow-2xs hover:border-[#1F5E4B]/40 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-[#17211D] leading-normal pt-0.5">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concepts & Glossary */}
      {concepts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#1F5E4B]" />
            Key Definitions & Concepts
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {concepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-xl border border-[#E2E7E3] space-y-1.5 hover:shadow-2xs transition-shadow"
              >
                <span className="text-xs font-bold text-[#1F5E4B]">
                  {concept.term}
                </span>
                <p className="text-xs text-[#3D4741] leading-relaxed">
                  {concept.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grounded Sources */}
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
