import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Layers,
  HelpCircle,
  GitFork,
  Sparkles,
  History,
  Play,
  RotateCcw,
  ArrowLeft,
  Settings2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateMindMap,
  getStudyTools,
  deleteStudyTool,
} from '../../api/studyToolService';
import { SummaryViewer } from './SummaryViewer';
import { FlashcardViewer } from './FlashcardViewer';
import { QuizViewer } from './QuizViewer';
import { MindMapViewer } from './MindMapViewer';
import { StudyToolHistory } from './StudyToolHistory';

export const StudyToolsPanel = ({
  notebookId,
  notebookTitle = 'Notebook',
  onSelectCitation,
}) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [selectedToolType, setSelectedToolType] = useState('summary'); // 'summary' | 'flashcards' | 'quiz' | 'mindmap'
  const [topic, setTopic] = useState('');
  const [summaryMode, setSummaryMode] = useState('detailed');
  const [itemCount, setItemCount] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');

  const [isGenerating, setIsGenerating] = useState(false);
  const [studyToolsList, setStudyToolsList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeViewerTool, setActiveViewerTool] = useState(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  const toast = useToast();

  const fetchHistory = useCallback(async () => {
    if (!notebookId) return;
    try {
      setIsLoadingHistory(true);
      const data = await getStudyTools(notebookId, { limit: 30 });
      setStudyToolsList(data?.studyTools || []);
    } catch (err) {
      console.error('Failed to fetch study tools history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [notebookId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerate = async () => {
    if (!notebookId) {
      toast.error('Invalid notebook reference');
      return;
    }

    try {
      setIsGenerating(true);
      let newTool;

      if (selectedToolType === 'summary') {
        newTool = await generateSummary(notebookId, {
          mode: summaryMode,
          topic,
        });
        toast.success('Summary generated successfully!');
      } else if (selectedToolType === 'flashcards') {
        newTool = await generateFlashcards(notebookId, {
          count: itemCount,
          difficulty,
          topic,
        });
        toast.success(`Generated ${newTool?.result?.totalCards || itemCount} flashcards!`);
      } else if (selectedToolType === 'quiz') {
        newTool = await generateQuiz(notebookId, {
          count: Math.min(itemCount, 20),
          difficulty,
          topic,
        });
        toast.success(`Generated ${newTool?.result?.totalQuestions || itemCount} quiz questions!`);
      } else if (selectedToolType === 'mindmap') {
        newTool = await generateMindMap(notebookId, {
          topic,
        });
        toast.success('Knowledge Mind Map generated!');
      }

      if (newTool) {
        setStudyToolsList((prev) => [newTool, ...prev]);
        setActiveViewerTool(newTool);
        setIsViewerModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate study tool');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTool = async (toolId) => {
    try {
      await deleteStudyTool(notebookId, toolId);
      setStudyToolsList((prev) => prev.filter((t) => t._id !== toolId));
      if (activeViewerTool?._id === toolId) {
        setActiveViewerTool(null);
        setIsViewerModalOpen(false);
      }
      toast.success('Study material deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete study tool');
    }
  };

  const toolsConfig = [
    {
      id: 'summary',
      title: 'Executive Summary',
      description: 'Grounded executive overview with key takeaways and concept glossary.',
      icon: FileText,
      badge: 'Grounded Overview',
    },
    {
      id: 'flashcards',
      title: 'Active Recall Flashcards',
      description: 'Flip-card decks with questions, answers, and source citations.',
      icon: Layers,
      badge: 'Interactive Cards',
    },
    {
      id: 'quiz',
      title: 'Multiple Choice Quiz',
      description: '4-option assessment testing grounded comprehension with score review.',
      icon: HelpCircle,
      badge: 'Knowledge Check',
    },
    {
      id: 'mindmap',
      title: 'Knowledge Mind Map',
      description: 'Hierarchical concept taxonomy and relational branch tree.',
      icon: GitFork,
      badge: 'Concept Tree',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Studio Header & Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E7E3]">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#1F5E4B]" />
            AI Study Studio
          </h3>
          <p className="text-[11px] text-[#6B756F]">
            Transform uploaded notebook sources into interactive study materials
          </p>
        </div>

        <div className="flex items-center bg-[#FAFBF9] border border-[#E2E7E3] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-[#17211D] shadow-2xs font-bold'
                : 'text-[#6B756F] hover:text-[#17211D]'
            }`}
          >
            Studio Generator
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'history'
                ? 'bg-white text-[#17211D] shadow-2xs font-bold'
                : 'text-[#6B756F] hover:text-[#17211D]'
            }`}
          >
            <History className="w-3 h-3" />
            History ({studyToolsList.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="space-y-4">
          {/* Tool Selector Cards */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {toolsConfig.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedToolType === tool.id;

              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolType(tool.id)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#1F5E4B] bg-[#E8EFEA]/30 ring-1 ring-[#1F5E4B]'
                      : 'border-[#E2E7E3] bg-white hover:border-[#1F5E4B]/60 hover:bg-[#FAFBF9]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-[#E8EFEA] text-[#1F5E4B] flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <Badge variant={isSelected ? 'forest' : 'neutral'} size="sm">
                        {tool.badge}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-bold text-[#17211D]">
                      {tool.title}
                    </h4>
                    <p className="text-[11px] text-[#6B756F] line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generator Parameters Configuration Box */}
          <div className="p-4 bg-white rounded-xl border border-[#E2E7E3] shadow-2xs space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#17211D]">
              <Settings2 className="w-3.5 h-3.5 text-[#1F5E4B]" />
              Generator Options
            </div>

            {/* Topic Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#6B756F]">
                Specific Topic or Focus (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. CAP Theorem, Quantum Gates, Cell Division..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E3] focus:outline-none focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B]"
              />
            </div>

            {/* Tool-specific controls */}
            {selectedToolType === 'summary' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#6B756F]">
                  Summary Length & Depth
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSummaryMode('detailed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      summaryMode === 'detailed'
                        ? 'border-[#1F5E4B] bg-[#E8EFEA] text-[#1F5E4B]'
                        : 'border-[#E2E7E3] text-[#6B756F] hover:bg-[#FAFBF9]'
                    }`}
                  >
                    Detailed & Concepts
                  </button>
                  <button
                    type="button"
                    onClick={() => setSummaryMode('short')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      summaryMode === 'short'
                        ? 'border-[#1F5E4B] bg-[#E8EFEA] text-[#1F5E4B]'
                        : 'border-[#E2E7E3] text-[#6B756F] hover:bg-[#FAFBF9]'
                    }`}
                  >
                    Concise (Key Points)
                  </button>
                </div>
              </div>
            )}

            {(selectedToolType === 'flashcards' || selectedToolType === 'quiz') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#6B756F]">
                    Quantity
                  </label>
                  <select
                    value={itemCount}
                    onChange={(e) => setItemCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E3] bg-white focus:outline-none focus:border-[#1F5E4B]"
                  >
                    <option value={5}>5 Items</option>
                    <option value={10}>10 Items</option>
                    <option value={15}>15 Items</option>
                    <option value={20}>20 Items</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#6B756F]">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E7E3] bg-white focus:outline-none focus:border-[#1F5E4B]"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Trigger */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                disabled={isGenerating}
                onClick={handleGenerate}
                leftIcon={isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? 'Synthesizing with Grounded AI...' : `Generate ${toolsConfig.find((t) => t.id === selectedToolType)?.title}`}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <StudyToolHistory
          studyTools={studyToolsList}
          activeToolId={activeViewerTool?._id}
          isLoading={isLoadingHistory}
          onSelectTool={(tool) => {
            setActiveViewerTool(tool);
            setIsViewerModalOpen(true);
          }}
          onDeleteTool={handleDeleteTool}
        />
      )}

      {/* Viewer Modal */}
      <Modal
        isOpen={isViewerModalOpen && !!activeViewerTool}
        onClose={() => setIsViewerModalOpen(false)}
        title={activeViewerTool?.title || 'Study Material'}
        size="2xl"
      >
        <div className="p-6">
          {activeViewerTool?.toolType === 'summary' && (
            <SummaryViewer
              studyTool={activeViewerTool}
              onSelectCitation={onSelectCitation}
            />
          )}

          {activeViewerTool?.toolType === 'flashcards' && (
            <FlashcardViewer
              studyTool={activeViewerTool}
              onSelectCitation={onSelectCitation}
            />
          )}

          {activeViewerTool?.toolType === 'quiz' && (
            <QuizViewer
              studyTool={activeViewerTool}
              onSelectCitation={onSelectCitation}
            />
          )}

          {activeViewerTool?.toolType === 'mindmap' && (
            <MindMapViewer
              studyTool={activeViewerTool}
              onSelectCitation={onSelectCitation}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
