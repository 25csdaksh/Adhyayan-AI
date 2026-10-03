import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  FileText,
  Compass,
  CheckCircle2,
  ArrowRight,
  X,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { userService } from '../../api/userService';

export const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    {
      title: 'Welcome to StudyLM',
      subtitle: 'Your personal AI research and study companion',
      icon: Sparkles,
      iconBg: 'bg-[#E8F2EE] text-[#1F5E4B]',
      content:
        'StudyLM allows you to build personalized academic notebooks, ingest rich documents, and ask complex questions grounded directly in your sources with verifiable citations.',
      highlight: 'Every AI answer is strictly grounded in the documents you provide.',
    },
    {
      title: '1. Create Notebooks & Add Sources',
      subtitle: 'Organize research by course, subject, or project',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-700',
      content:
        'Upload lecture slides (PDFs), notes (DOCX/TXT), web URLs, or custom text. StudyLM cleans, extracts, and vector-indexes your materials with Google Gemini embeddings.',
      highlight: 'Supports multi-format ingestion with hop-by-hop SSRF security protection.',
    },
    {
      title: '2. Grounded AI Q&A with Citations',
      subtitle: 'Zero hallucinations — verifiable proof for every claim',
      icon: BookOpen,
      iconBg: 'bg-emerald-50 text-emerald-700',
      content:
        'Ask questions in natural language. Click citation badges [1] to open the deep-linked preview showing surrounding context, PDF page numbers, and exact passages.',
      highlight: 'Sources remain the sole factual authority; AI never makes up facts.',
    },
    {
      title: '3. AI Study Tools & Synthesis',
      subtitle: 'Master any topic in minutes',
      icon: Zap,
      iconBg: 'bg-amber-50 text-amber-700',
      content:
        'Generate structured executive summaries, active-recall flashcard decks, multiple-choice practice quizzes with explanations, and conceptual mind maps.',
      highlight: 'Tailored study materials generated directly from your uploaded syllabus.',
    },
    {
      title: '4. Advanced Deep Research & Synthesis',
      subtitle: 'Cross-examine sources and resolve discrepancies',
      icon: Compass,
      iconBg: 'bg-indigo-50 text-indigo-700',
      content:
        'Formulate bounded research plans, cross-synthesize across multiple documents, surface conflicting source claims ("Sources differ"), and export academic reports to Markdown.',
      highlight: 'Includes Claim-Evidence verification matrices and knowledge gap detection.',
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await userService.updateProfile({ onboardingCompleted: true });
    } catch {
      // Non-blocking fallback
    } finally {
      setSubmitting(false);
      if (onComplete) onComplete();
      onClose();
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title=""
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === step ? 'w-6 bg-[#1F5E4B]' : 'w-1.5 bg-[#E2E7E3]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isLast && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              rightIcon={isLast ? CheckCircle2 : ArrowRight}
              onClick={handleNext}
              disabled={submitting}
            >
              {isLast ? 'Get Started' : 'Next Step'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="py-2 text-center space-y-4">
        <div
          className={`w-14 h-14 rounded-2xl ${currentStep.iconBg} flex items-center justify-center mx-auto shadow-2xs transition-transform duration-300 scale-105`}
        >
          <currentStep.icon className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#17211D]">{currentStep.title}</h3>
          <p className="text-xs font-semibold text-[#1F5E4B]">{currentStep.subtitle}</p>
        </div>

        <p className="text-xs sm:text-sm text-[#4F5B54] max-w-md mx-auto leading-relaxed">
          {currentStep.content}
        </p>

        <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#D8E9E2] text-xs text-[#1F5E4B] font-medium flex items-center justify-center gap-1.5 max-w-md mx-auto">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#1F5E4B]" />
          <span>{currentStep.highlight}</span>
        </div>
      </div>
    </Modal>
  );
};
