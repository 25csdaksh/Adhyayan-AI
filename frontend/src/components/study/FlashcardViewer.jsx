import React, { useState } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  Eye,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CitationCard } from '../chat/CitationCard';

export const FlashcardViewer = ({ studyTool, onSelectCitation }) => {
  const cards = studyTool?.result?.cards || [];
  const [deck, setDeck] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'grid'

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-[#6B756F]">
        No flashcards available in this deck.
      </div>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
  };

  const handleRestart = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
    setDeck(cards);
  };

  const getDifficultyVariant = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'forest';
      case 'hard':
        return 'accent';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E7E3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#17211D]">
              {studyTool.title || 'Flashcard Deck'}
            </h3>
            <Badge variant="forest" size="sm">
              {deck.length} Cards
            </Badge>
          </div>
          <p className="text-xs text-[#6B756F]">
            Click card or press flip to reveal answers and grounded source explanations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            leftIcon={<Shuffle className="w-3.5 h-3.5" />}
          >
            Shuffle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'card' ? 'grid' : 'card')}
          >
            {viewMode === 'card' ? 'Grid View' : 'Deck View'}
          </Button>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="space-y-5 max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B756F]">
              <span>Card {currentIndex + 1} of {deck.length}</span>
              <span>{progressPercent}% completed</span>
            </div>
            <div className="h-1.5 w-full bg-[#E2E7E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1F5E4B] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[260px] p-6 bg-white rounded-2xl border-2 border-[#E2E7E3] hover:border-[#1F5E4B] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative group"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B756F] uppercase tracking-wider">
                {isFlipped ? 'Answer & Explanation' : 'Question'}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={getDifficultyVariant(currentCard.difficulty)} size="sm">
                  {currentCard.difficulty || 'Medium'}
                </Badge>
                <span className="text-xs font-bold text-[#1F5E4B] bg-[#E8EFEA] px-2 py-0.5 rounded-full">
                  #{currentIndex + 1}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="py-6 text-center">
              {isFlipped ? (
                <div className="space-y-3">
                  <p className="text-base sm:text-lg font-medium text-[#17211D] leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>
              ) : (
                <p className="text-lg sm:text-xl font-bold text-[#17211D] leading-relaxed">
                  {currentCard.question}
                </p>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F1] text-xs text-[#6B756F]">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                Click anywhere to flip
              </span>

              {isFlipped && currentCard.citations && currentCard.citations.length > 0 && (
                <span className="text-[#1F5E4B] font-semibold">
                  {currentCard.citations.length} Source Citation(s)
                </span>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsFlipped(!isFlipped)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {isFlipped ? 'Show Question' : 'Reveal Answer'}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleNext}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>

          {/* Active Card Citations */}
          {isFlipped && currentCard.citations && currentCard.citations.length > 0 && (
            <div className="pt-4 border-t border-[#E2E7E3] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B756F]">
                Supporting Citations
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {currentCard.citations.map((citation, idx) => (
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
      ) : (
        /* Grid Overview Mode */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deck.map((card, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F5E4B]">#{idx + 1}</span>
                  <Badge variant={getDifficultyVariant(card.difficulty)} size="sm">
                    {card.difficulty}
                  </Badge>
                </div>
                <h5 className="text-sm font-bold text-[#17211D]">
                  {card.question}
                </h5>
                <p className="text-xs text-[#3D4741] line-clamp-3 bg-[#FAFBF9] p-2 rounded-lg border border-[#E2E7E3]">
                  {card.answer}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('card');
                    setIsFlipped(false);
                  }}
                  className="text-xs font-bold text-[#1F5E4B] hover:underline"
                >
                  Study Card →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
