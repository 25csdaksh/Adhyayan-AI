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
    <div className="space-y-2">
      {/* Quick Prompt Chips (when input is empty) */}
      {!text && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-[#8E9993] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#1F5E4B]" /> Suggested:
          </span>
          {promptChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setText(chip);
                textareaRef.current?.focus();
              }}
              className="px-2.5 py-1 bg-white hover:bg-[#E8F2EE] hover:text-[#1F5E4B] border border-[#E2E7E3] hover:border-[#1F5E4B] rounded-full text-xs text-[#6B756F] whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative bg-white rounded-2xl border border-[#E2E7E3] focus-within:border-[#1F5E4B] focus-within:ring-1 focus-within:ring-[#1F5E4B] shadow-sm transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your sources..."
          disabled={disabled}
          className="w-full bg-transparent px-4 pt-3.5 pb-12 text-xs sm:text-sm text-[#17211D] placeholder:text-[#8E9993] focus:outline-none resize-none max-h-40 leading-relaxed"
        />

        {/* Bottom Toolbar inside Input */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onAttachSource}
              className="p-1.5 text-[#6B756F] hover:text-[#1F5E4B] hover:bg-[#E8F2EE] rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Add source to grounding context"
            >
              <Paperclip className="w-4 h-4" />
              <span className="hidden sm:inline font-medium text-[11px]">{sourceCount} sources</span>
            </button>

            <button
              type="button"
              className="p-1.5 text-[#8E9993] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
              title="Voice input (Phase 04)"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-[#8E9993]">
              Press <kbd className="font-mono bg-[#F2F5F3] px-1.5 py-0.5 rounded border border-[#E2E7E3] text-[#6B756F]">Enter ↵</kbd>
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!text.trim() || disabled}
              className="!p-2 !rounded-xl"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
