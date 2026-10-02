import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  HelpCircle,
  Layers,
  ListOrdered,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Volume2,
  Share2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { MOCK_STUDY_TOOLS } from '../../mock/mockData';
import { useToast } from '../../context/ToastContext';

export const StudyToolsPanel = ({ notebookTitle = 'Computer Networks' }) => {
  const [activeToolModal, setActiveToolModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const toast = useToast();

  const handleSelectQuizOption = (qId, optionIdx) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const tools = [
    {
      id: 'summary',
      title: 'Executive Summary',
      description: 'Concise, high-yield overview of all grounded notebook sources.',
      icon: FileText,
      badge: 'Auto-updated',
      variant: 'forest',
    },
    {
      id: 'notes',
      title: 'Structured Notes',
      description: 'Synthesized study outlines with topics, definitions, and formulas.',
      icon: BookOpen,
      badge: '3 Guides',
      variant: 'emerald',
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz',
      description: 'Multiple choice knowledge test generated from your uploaded materials.',
      icon: HelpCircle,
      badge: '3 Questions',
      variant: 'accent',
    },
    {
      id: 'flashcards',
      title: 'Active Recall Flashcards',
      description: 'Flip-card decks designed for spaced repetition & exam readiness.',
      icon: Layers,
      badge: '4 Cards',
      variant: 'blue',
    },
    {
      id: 'keyPoints',
      title: 'High-Yield Key Points',
      description: 'Bullet-point takeaways and critical architectural rules.',
      icon: ListOrdered,
      badge: '5 Points',
      variant: 'neutral',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#1F5E4B]" />
            Study Studio Tools
          </h3>
          <p className="text-[11px] text-[#6B756F]">AI-generated synthesis from your sources</p>
        </div>
      </div>

      {/* Tools Card Grid */}
      <div className="space-y-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => setActiveToolModal(tool.id)}
              className="p-3.5 bg-white hover:bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] shadow-2xs transition-all duration-150 cursor-pointer group select-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F2EE] border border-[#D8E9E2] text-[#1F5E4B] flex items-center justify-center shrink-0 group-hover:bg-[#1F5E4B] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors">
                        {tool.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#6B756F] line-clamp-1 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <Badge variant={tool.variant} size="sm">
                    {tool.badge}
                  </Badge>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8E9993] group-hover:text-[#1F5E4B] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio Overview Banner Preview */}
      <div className="p-3.5 bg-gradient-to-r from-[#FAF4E8] to-[#F5EBD4] rounded-xl border border-[#F2E4C2] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D6A84F] text-[#17211D] flex items-center justify-center font-bold">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17211D]">Audio Deep Dive (Upcoming)</h4>
            <p className="text-[11px] text-[#8A671D]">2-host podcast discussion of your notes</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-[#8A671D] bg-white/70 px-2 py-0.5 rounded-full">
          Phase 05
        </span>
      </div>

      {/* Interactive Tool Modals */}
      {/* 1. Summary Modal */}
      <Modal
        isOpen={activeToolModal === 'summary'}
        onClose={() => setActiveToolModal(null)}
        title={`Summary: ${notebookTitle}`}
        description="Comprehensive study overview compiled from all active sources."
        footer={
          <Button variant="primary" onClick={() => setActiveToolModal(null)}>
            Close Summary
          </Button>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm text-[#17211D] leading-relaxed">
          <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] space-y-3">
            <h4 className="font-bold text-sm text-[#1F5E4B]">Executive Key Takeaways</h4>
            <div className="space-y-2 text-[#17211D]">
              <p>• <strong>Protocol Hierarchy:</strong> Layered architecture creates clean abstractions. TCP guarantees ordered byte-stream delivery with congestion control, while UDP offers lightweight low-latency transmission.</p>
              <p>• <strong>Congestion Mechanics:</strong> Governed by Slow Start (exponential cwnd increase), Congestion Avoidance (linear AIMD increase), Fast Retransmit (3 duplicate ACKs), and Fast Recovery.</p>
              <p>• <strong>Subnetting &amp; Addressing:</strong> CIDR and VLSM prevent IPv4 address exhaustion through variable length prefix allocation.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* 2. Structured Notes Modal */}
      <Modal
        isOpen={activeToolModal === 'notes'}
        onClose={() => setActiveToolModal(null)}
        title={`Study Guides & Notes: ${notebookTitle}`}
        description="Synthesized reference notes categorized by topic."
        footer={
          <Button variant="primary" onClick={() => setActiveToolModal(null)}>
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          {MOCK_STUDY_TOOLS.notes.map((n) => (
            <div key={n.id} className="p-3.5 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#1F5E4B]" />
                <span className="text-xs sm:text-sm font-semibold text-[#17211D]">{n.title}</span>
              </div>
              <span className="text-[11px] text-[#8E9993]">{n.date}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* 3. Quiz Modal */}
      <Modal
        isOpen={activeToolModal === 'quiz'}
        onClose={() => setActiveToolModal(null)}
        title="Knowledge Check Quiz"
        description="Verify your comprehension of the core concepts grounded in your sources."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[#6B756F]">
              Answered: {Object.keys(quizAnswers).length} / {MOCK_STUDY_TOOLS.quiz.length}
            </span>
            <Button variant="primary" onClick={() => setActiveToolModal(null)}>
              Finish Quiz
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {MOCK_STUDY_TOOLS.quiz.map((q, qIndex) => {
            const selectedOpt = quizAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            return (
              <div key={q.id} className="p-4 rounded-xl border border-[#E2E7E3] bg-[#FAFBF9] space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-[#17211D]">
                  {qIndex + 1}. {q.question}
                </h4>

                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedOpt === optIndex;
                    const isCorrect = optIndex === q.correctIndex;
                    let style = 'bg-white border-[#E2E7E3] text-[#17211D] hover:bg-[#F2F5F3]';
                    if (isAnswered) {
                      if (isCorrect) {
                        style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                      }
                    } else if (isSelected) {
                      style = 'bg-[#E8F2EE] border-[#1F5E4B] text-[#1F5E4B] font-semibold';
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => handleSelectQuizOption(q.id, optIndex)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <p className="text-xs text-[#6B756F] bg-white p-2.5 rounded-lg border border-[#EDF1EE] italic">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* 4. Flashcards Modal */}
      <Modal
        isOpen={activeToolModal === 'flashcards'}
        onClose={() => setActiveToolModal(null)}
        title="Spaced Repetition Flashcards"
        description="Click card to flip between Question and Answer."
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              disabled={flashcardIdx === 0}
              onClick={() => { setFlashcardIdx((prev) => prev - 1); setIsFlipped(false); }}
            >
              Previous Card
            </Button>
            <span className="text-xs font-semibold text-[#17211D]">
              {flashcardIdx + 1} of {MOCK_STUDY_TOOLS.flashcards.length}
            </span>
            <Button
              variant="primary"
              size="sm"
              disabled={flashcardIdx === MOCK_STUDY_TOOLS.flashcards.length - 1}
              onClick={() => { setFlashcardIdx((prev) => prev + 1); setIsFlipped(false); }}
            >
              Next Card
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[200px] p-6 rounded-2xl border-2 border-[#1F5E4B]/30 bg-gradient-to-br from-white to-[#F7F8F6] shadow-sm flex flex-col justify-between items-center text-center cursor-pointer hover:border-[#1F5E4B] transition-all select-none"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F5E4B] bg-[#E8F2EE] px-2.5 py-0.5 rounded-full">
              {isFlipped ? 'Answer' : 'Question (Click to Flip)'}
            </span>

            <p className="text-sm sm:text-base font-medium text-[#17211D] my-4 leading-relaxed">
              {isFlipped
                ? MOCK_STUDY_TOOLS.flashcards[flashcardIdx].back
                : MOCK_STUDY_TOOLS.flashcards[flashcardIdx].front}
            </p>

            <span className="text-[11px] text-[#8E9993] flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Flip Card
            </span>
          </div>
        </div>
      </Modal>

      {/* 5. Key Points Modal */}
      <Modal
        isOpen={activeToolModal === 'keyPoints'}
        onClose={() => setActiveToolModal(null)}
        title="High-Yield Key Points"
        description="Critical definitions, rules, and exam formulas."
        footer={
          <Button variant="primary" onClick={() => setActiveToolModal(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-2.5">
          {MOCK_STUDY_TOOLS.keyPoints.map((pt, i) => (
            <div key={i} className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1F5E4B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-[#17211D] leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
