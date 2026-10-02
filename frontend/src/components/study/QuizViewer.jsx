import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Award,
  BookOpen,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CitationCard } from '../chat/CitationCard';

export const QuizViewer = ({ studyTool, onSelectCitation }) => {
  const questions = studyTool?.result?.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // { [qIndex]: selectedOptionIndex }
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-[#6B756F]">
        No quiz questions available.
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  const handleSelectOption = (index) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQ) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsCompleted(false);
  };

  // Calculate score
  const correctCount = questions.reduce((acc, q, idx) => {
    return acc + (userAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);
  const scorePercent = Math.round((correctCount / totalQ) * 100);

  const getOptionLetter = (idx) => String.fromCharCode(65 + idx);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E7E3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#17211D]">
              {studyTool.title || 'Multiple Choice Quiz'}
            </h3>
            <Badge variant="accent" size="sm">
              {totalQ} Questions
            </Badge>
          </div>
          <p className="text-xs text-[#6B756F]">
            Grounded multiple-choice assessment generated from notebook materials
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Restart Quiz
        </Button>
      </div>

      {!isCompleted ? (
        <div className="space-y-5 max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B756F]">
              <span>Question {currentIndex + 1} of {totalQ}</span>
              <span>Score: {correctCount} / {Object.keys(userAnswers).length}</span>
            </div>
            <div className="h-1.5 w-full bg-[#E2E7E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1F5E4B] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F5E4B] bg-[#E8EFEA] px-2.5 py-1 rounded-full">
                Question {currentIndex + 1}
              </span>
              <Badge variant="neutral" size="sm">
                {currentQ.difficulty || 'Medium'}
              </Badge>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-[#17211D] leading-snug">
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = currentQ.correctAnswer === idx;

                let optionStyles = 'border-[#E2E7E3] bg-white hover:border-[#1F5E4B] hover:bg-[#FAFBF9] text-[#17211D]';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'border-[#1F5E4B] bg-[#E8EFEA] text-[#1F5E4B] font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'border-rose-400 bg-rose-50 text-rose-800';
                  } else {
                    optionStyles = 'border-[#E2E7E3] bg-white opacity-60 text-[#6B756F]';
                  }
                } else if (isSelected) {
                  optionStyles = 'border-[#1F5E4B] bg-[#FAFBF9] ring-2 ring-[#1F5E4B]/20 text-[#17211D] font-semibold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-3 text-sm cursor-pointer disabled:cursor-default ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3] flex items-center justify-center font-bold text-xs text-[#17211D]">
                        {getOptionLetter(idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[#1F5E4B] flex-shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-3 flex items-center justify-end">
              {!isAnswerSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextQuestion}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {currentIndex + 1 < totalQ ? 'Next Question' : 'View Results'}
                </Button>
              )}
            </div>
          </div>

          {/* Explanation Card after submission */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1F5E4B]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#17211D]">
                  Grounded Explanation
                </h5>
              </div>
              <p className="text-sm text-[#3D4741] leading-relaxed">
                {currentQ.explanation}
              </p>

              {currentQ.citations && currentQ.citations.length > 0 && (
                <div className="pt-2 border-t border-[#E2E7E3]">
                  <h6 className="text-[11px] font-bold text-[#6B756F] uppercase mb-1.5">
                    Source Citations
                  </h6>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentQ.citations.map((c, idx) => (
                      <CitationCard
                        key={idx}
                        citation={c}
                        onSelectCitation={onSelectCitation}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Quiz Completion Summary Screen */
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="p-8 bg-white rounded-2xl border border-[#E2E7E3] text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#E8EFEA] text-[#1F5E4B] mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-[#17211D]">Quiz Completed!</h4>
              <p className="text-sm text-[#6B756F]">
                You scored <span className="font-bold text-[#1F5E4B]">{correctCount}</span> out of{' '}
                <span className="font-bold text-[#17211D]">{totalQ}</span> questions ({scorePercent}%)
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleRestart}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retake Quiz
              </Button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F]">
              Question Review & Breakdown
            </h4>

            <div className="space-y-2.5">
              {questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const isPassed = userChoice === q.correctAnswer;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      isPassed ? 'border-[#1F5E4B]/40 bg-[#FAFBF9]' : 'border-rose-200 bg-rose-50/40'
                    } space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1F5E4B] flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-[#17211D]">
                          Q{idx + 1}: {q.question}
                        </span>
                      </div>
                      <Badge variant={isPassed ? 'forest' : 'accent'} size="sm">
                        {isPassed ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>

                    <div className="text-xs text-[#6B756F] pl-6 space-y-1">
                      <p>
                        <span className="font-semibold text-[#17211D]">Correct Answer:</span>{' '}
                        {q.options[q.correctAnswer]}
                      </p>
                      {!isPassed && userChoice !== undefined && (
                        <p className="text-rose-700">
                          <span className="font-semibold">Your Answer:</span> {q.options[userChoice]}
                        </p>
                      )}
                      <p className="pt-1 text-[#3D4741] italic">"{q.explanation}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
