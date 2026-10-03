import React from 'react';

/**
 * Universal Citation and Markdown Formatter for StudyLM UI
 * Formats:
 * 1. Citations: [SOURCE_1], [1], [SOURCE_1, SOURCE_2], [1, 2, 3] -> interactive badge pills
 * 2. Markdown Bold: **text** -> <strong>text</strong>
 * 3. Markdown Italic: *text* -> <em>text</em>
 * 4. Markdown Inline Code: `code` -> <code ...>code</code>
 */

/**
 * Render inline text with bold, code, and clickable citation pills
 * @param {string} text
 * @param {Array} citations
 * @param {Function} onSelectCitation
 * @returns {React.ReactNode}
 */
export const renderRichFormattedText = (text, citations = [], onSelectCitation = null) => {
  if (!text || typeof text !== 'string') return text;

  // Match citation groups like [SOURCE_1, SOURCE_2] or [1, 2, 3] or [SOURCE_1] or [1]
  // Regex matches anything inside square brackets that contains SOURCE_ or numbers
  const citationBracketRegex = /(\[(?:SOURCE_\s*\d+|\d+)(?:\s*,\s*(?:SOURCE_\s*\d+|\d+))*\])/gi;

  const chunks = text.split(citationBracketRegex);

  return chunks.map((chunk, chunkIdx) => {
    if (!chunk) return null;

    // Check if chunk is a citation bracket e.g. [SOURCE_1, SOURCE_2] or [1]
    if (citationBracketRegex.test(chunk)) {
      // Extract all numbers from this bracket
      const numberMatches = chunk.match(/\d+/g);
      if (numberMatches && numberMatches.length > 0) {
        return (
          <span key={`cit-grp-${chunkIdx}`} className="inline-flex items-center gap-1 mx-1 align-baseline">
            {numberMatches.map((numStr, nIdx) => {
              const citNum = parseInt(numStr, 10);
              const citObj = Array.isArray(citations)
                ? citations.find((c) => c.citationNumber === citNum)
                : null;

              return (
                <button
                  key={`cit-btn-${chunkIdx}-${nIdx}`}
                  type="button"
                  onClick={() => citObj && onSelectCitation && onSelectCitation(citObj)}
                  className="inline-flex items-center justify-center px-1.5 py-0.2 min-w-[1.25rem] rounded text-[11px] font-bold bg-[#E8F2EE] text-[#1F5E4B] border border-[#C2D8CD] hover:bg-[#1F5E4B] hover:text-white cursor-pointer transition-all shadow-2xs"
                  title={
                    citObj
                      ? `${citObj.documentTitle || 'Source'} (p.${citObj.pageNumber || 1})`
                      : `Source Citation [${citNum}]`
                  }
                >
                  {citNum}
                </button>
              );
            })}
          </span>
        );
      }
    }

    // Now format markdown bold (**text**), inline code (`code`), and italics (*text*)
    return renderInlineMarkdown(chunk, `txt-${chunkIdx}`);
  });
};

/**
 * Parses bold, inline code, and italic within a text segment
 */
const renderInlineMarkdown = (rawText, keyPrefix) => {
  if (!rawText) return null;

  // Split by bold (**...**) and inline code (`...`)
  const mdRegex = /(\*\*.*?\*\*|`.*?`|\*[^\*]+?\*)/g;
  const parts = rawText.split(mdRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    const key = `${keyPrefix}-${i}`;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={key} className="font-bold text-[#17211D]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#EDF2EE] font-mono text-[11px] sm:text-xs text-[#1F5E4B] border border-[#D5E2DB]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return (
        <em key={key} className="italic text-[#2E3B34]">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={key}>{part}</span>;
  });
};

/**
 * Format multi-line markdown block with headings, paragraphs, and list items
 */
export const renderBlockMarkdown = (content, citations = [], onSelectCitation = null) => {
  if (!content || typeof content !== 'string') return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={`empty-${idx}`} className="h-1.5" />;
        }

        // Heading 4: #### Heading
        if (line.startsWith('#### ')) {
          return (
            <h5 key={`h4-${idx}`} className="text-xs font-bold text-[#1F5E4B] uppercase tracking-wider mt-3 mb-1">
              {renderRichFormattedText(line.replace(/^####\s*/, ''), citations, onSelectCitation)}
            </h5>
          );
        }

        // Heading 3: ### Heading
        if (line.startsWith('### ')) {
          return (
            <h4 key={`h3-${idx}`} className="text-sm sm:text-base font-bold text-[#17211D] mt-3 mb-1.5">
              {renderRichFormattedText(line.replace(/^###\s*/, ''), citations, onSelectCitation)}
            </h4>
          );
        }

        // Heading 2: ## Heading
        if (line.startsWith('## ')) {
          return (
            <h3 key={`h2-${idx}`} className="text-base sm:text-lg font-bold text-[#17211D] mt-4 mb-2 pb-1 border-b border-[#EDF1EE]">
              {renderRichFormattedText(line.replace(/^##\s*/, ''), citations, onSelectCitation)}
            </h3>
          );
        }

        // Bullet point: - or * or •
        if (/^[\*\•\-]\s/.test(line)) {
          const bulletContent = line.replace(/^[\*\•\-]\s*/, '');
          return (
            <div key={`bullet-${idx}`} className="flex items-start gap-2.5 ml-2 text-xs sm:text-sm text-[#2E3B34] leading-relaxed my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E4B] mt-2 shrink-0" />
              <div className="flex-1">
                {renderRichFormattedText(bulletContent, citations, onSelectCitation)}
              </div>
            </div>
          );
        }

        // Numbered item: 1. 2. etc
        if (/^\d+\.\s/.test(line)) {
          const numMatch = line.match(/^(\d+)\.\s*(.*)/);
          const itemNum = numMatch ? numMatch[1] : '';
          const itemText = numMatch ? numMatch[2] : line;
          return (
            <div key={`num-${idx}`} className="flex items-start gap-2.5 ml-2 text-xs sm:text-sm text-[#2E3B34] leading-relaxed my-1">
              <span className="font-bold text-xs text-[#1F5E4B] min-w-[1.25rem] mt-0.5">{itemNum}.</span>
              <div className="flex-1">
                {renderRichFormattedText(itemText, citations, onSelectCitation)}
              </div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={`p-${idx}`} className="text-xs sm:text-sm text-[#2E3B34] leading-relaxed my-1">
            {renderRichFormattedText(line, citations, onSelectCitation)}
          </p>
        );
      })}
    </div>
  );
};
