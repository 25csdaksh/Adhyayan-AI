import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Sparkles,
  ArrowUp,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const ChatInput = ({
  onSend,
  disabled = false,
  onAttachSource,
  sourceCount = 0,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;

    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const promptChips = [
    'Summarize Unit 1 key concepts',
    'Compare OSI vs TCP/IP layer by layer',
    'Explain TCP Congestion Control algorithms',
    'Generate a 5-question multiple choice quiz',
  ];

  return (
    <div className="space-y-2.5">
      {/* Quick Prompt Chips (when input is empty) */}
      {!text && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-[#6B756F] shrink-0 flex items-center gap-1.5 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" /> Suggested:
          </span>
          {promptChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setText(chip);
                textareaRef.current?.focus();
              }}
              className="px-3 py-1 bg-white/90 hover:bg-[#E8F2EE] hover:text-[#1F5E4B] border border-[#DCE4DE] hover:border-[#1F5E4B] rounded-full text-xs font-medium text-[#4A5550] whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Main Floating Input Container */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-[#D5DDD7] focus-within:border-[#1F5E4B] focus-within:ring-2 focus-within:ring-[#1F5E4B]/15 shadow-md shadow-slate-900/5 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your sources, request a summary, or quiz yourself..."
          disabled={disabled}
          className="w-full bg-transparent px-4 pt-3.5 pb-12 text-xs sm:text-sm font-sans text-[#17211D] placeholder:text-[#8E9993] focus:outline-none resize-none max-h-40 leading-relaxed"
        />

        {/* Bottom Toolbar inside Input */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onAttachSource}
              className="px-2.5 py-1 text-[#1F5E4B] bg-[#E8F2EE]/80 hover:bg-[#D8E9E2] border border-[#D8E9E2] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Add source to grounding context"
            >
              <Paperclip className="w-3.5 h-3.5 text-[#1F5E4B]" />
              <span>{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</span>
            </button>

            <button
              type="button"
              className="p-1.5 text-[#8E9993] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] text-[#8E9993] font-medium">
              Press <kbd className="font-mono bg-[#F2F5F3] px-1.5 py-0.5 rounded border border-[#E2E7E3] text-[#4A5550]">Enter ↵</kbd>
            </span>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || disabled}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all duration-200 cursor-pointer
                ${text.trim() && !disabled
                  ? 'bg-gradient-to-tr from-[#1F5E4B] to-[#144234] text-white shadow-md shadow-[#1F5E4B]/25 hover:scale-105 active:scale-95'
                  : 'bg-[#E2E8E4] text-[#8E9993] cursor-not-allowed opacity-60'}`}
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
