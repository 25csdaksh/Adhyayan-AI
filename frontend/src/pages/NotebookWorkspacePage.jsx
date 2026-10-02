import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Share2,
  Settings,
  MoreVertical,
  FileText,
  Sparkles,
  Layers,
  MessageSquare,
  HelpCircle,
  Volume2,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SourceCard } from '../components/sources/SourceCard';
import { AddSourceModal } from '../components/sources/AddSourceModal';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { StudyToolsPanel } from '../components/study/StudyToolsPanel';
import { MOCK_NOTEBOOKS, MOCK_CHAT_CONVERSATION } from '../mock/mockData';
import { notebookService } from '../api/notebookService';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';

export const NotebookWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState(MOCK_CHAT_CONVERSATION);
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [selectedSourceSnippet, setSelectedSourceSnippet] = useState(null);

  // Responsive workspace tab state for tablet & mobile
  const [mobileActivePanel, setMobileActivePanel] = useState('chat'); // 'sources' | 'chat' | 'tools'
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNotebook = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await notebookService.getNotebook(id);
        if (isMounted) {
          if (response?.data?.notebook) {
            setNotebook(response.data.notebook);
          } else {
            setError('Notebook not found or you do not have permission to view it.');
          }
        }
      } catch (err) {
        if (isMounted) {
          const errMsg = err?.response?.data?.message || 'Failed to load notebook. Please try again.';
          setError(errMsg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchNotebook();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAddSource = (newSource) => {
    setSources((prev) => [newSource, ...prev]);
    toast.success(`Source "${newSource.title}" added to grounding index`, 'Source Added');
  };

  const handleRemoveSource = (sourceId) => {
    const target = sources.find((s) => s.id === sourceId);
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    toast.info(`Removed source "${target?.title || ''}"`, 'Source Removed');
  };

  const handleSendMessage = (userQuery) => {
    const newUserMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);

    // Simulate AI grounded response after short realistic pause
    setTimeout(() => {
      const primarySource = sources[0] || { title: 'Uploaded_Notes.pdf' };
      const simulatedAiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: `Based on your active study sources in **${notebook.title}** (specifically *${primarySource.title}*):\n\n### Synthesis & Key Concept Analysis\n* **Primary Finding**: The concepts in your query are strictly addressed in the foundational unit notes.\n* **Operational Rule**: When implementing these protocols, state synchronization ensures consistency across distributed nodes.\n\n*Review the citation below to inspect the original text snippet in your source document.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          {
            id: `c-${Date.now()}`,
            sourceTitle: primarySource.title,
            page: primarySource.pages ? Math.floor(primarySource.pages / 3) : 14,
            snippet: primarySource.snippet || 'Fundamental principles documented in the grounded research collection.',
          },
        ],
      };
      setMessages((prev) => [...prev, simulatedAiMsg]);
    }, 600);
  };

  const handleClearConversation = () => {
    setMessages([]);
    toast.info('Conversation history cleared', 'Workspace Reset');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#F7F8F6] items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E7E3] p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-3 border-[#1F5E4B] border-t-transparent animate-spin mx-auto" />
          <div>
            <h2 className="text-base font-bold text-[#17211D]">Loading Workspace...</h2>
            <p className="text-xs text-[#6B756F] mt-1">Retrieving your notebook and study environment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notebook) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#F7F8F6] items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E7E3] p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FDEDEC] text-[#D32F2F] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#17211D]">Notebook Not Found</h2>
            <p className="text-xs text-[#6B756F] mt-1.5 leading-relaxed">
              {error || 'This notebook does not exist or you do not have permission to access it.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#F7F8F6] overflow-hidden">
      {/* Workspace Sub-Header */}
      <div className="bg-white border-b border-[#E2E7E3] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-1.5 text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#17211D] truncate">
                {notebook.title}
              </h1>
              <Badge variant="forest" size="sm" dot>
                {sources.length} sources active
              </Badge>
            </div>
            <p className="text-[11px] text-[#6B756F] truncate hidden sm:block">
              {notebook.description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Panel collapse controls for Desktop */}
        <div className="hidden xl:flex items-center gap-1 text-[#8E9993]">
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="p-1.5 hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors"
            title={leftPanelCollapsed ? 'Show Sources' : 'Collapse Sources'}
          >
            {leftPanelCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4 text-[#1F5E4B]" />}
          </button>
          <button
            type="button"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="p-1.5 hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors"
            title={rightPanelCollapsed ? 'Show Study Studio' : 'Collapse Study Studio'}
          >
            {rightPanelCollapsed ? <PanelRight className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4 text-[#1F5E4B]" />}
          </button>
        </div>

        {/* Mobile & Tablet Panel Switcher Bar */}
        <div className="flex lg:hidden items-center p-1 bg-[#F2F5F3] rounded-xl border border-[#E2E7E3] gap-1">
          <button
            type="button"
            onClick={() => setMobileActivePanel('sources')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              mobileActivePanel === 'sources'
                ? 'bg-white text-[#1F5E4B] shadow-2xs'
                : 'text-[#6B756F]'
            }`}
          >
            Sources ({sources.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileActivePanel('chat')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              mobileActivePanel === 'chat'
                ? 'bg-white text-[#1F5E4B] shadow-2xs'
                : 'text-[#6B756F]'
            }`}
          >
            AI Chat
          </button>
          <button
            type="button"
            onClick={() => setMobileActivePanel('tools')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              mobileActivePanel === 'tools'
                ? 'bg-white text-[#1F5E4B] shadow-2xs'
                : 'text-[#6B756F]'
            }`}
          >
            Study Tools
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Plus}
            onClick={() => setAddSourceOpen(true)}
          >
            Add Source
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={RotateCcw}
            onClick={handleClearConversation}
            title="Clear Chat History"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main 3-Panel Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: LEFT SOURCES PANEL */}
        <div
          className={`bg-white border-r border-[#E2E7E3] flex flex-col transition-all duration-200 shrink-0
            ${leftPanelCollapsed ? 'w-0 hidden' : 'w-72 sm:w-80'}
            ${mobileActivePanel === 'sources' ? 'flex w-full absolute inset-0 z-20 pt-16 bg-white' : 'hidden lg:flex'}`}
        >
          {/* Sources Header */}
          <div className="p-4 border-b border-[#EDF1EE] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1F5E4B]" />
                Sources ({sources.length})
              </h2>
              <p className="text-[11px] text-[#6B756F]">Active grounded documents</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              onClick={() => setAddSourceOpen(true)}
            >
              Add
            </Button>
          </div>

          {/* Source Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {sources.length > 0 ? (
              sources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onRemove={handleRemoveSource}
                  onViewSnippet={(s) => setSelectedSourceSnippet(s)}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4 text-xs text-[#6B756F] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-[#17211D]">No sources yet</p>
                <p className="text-xs text-[#6B756F] leading-relaxed max-w-xs mx-auto">
                  Add your first source to start building this notebook.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Plus}
                  className="mt-2"
                  onClick={() => setAddSourceOpen(true)}
                >
                  Add Source
                </Button>
              </div>
            )}
          </div>

          {/* Sources Footer Summary */}
          <div className="p-3 bg-[#FAFBF9] border-t border-[#EDF1EE] text-[11px] text-[#6B756F] flex items-center justify-between shrink-0">
            <span>Vector Index: Live</span>
            <span className="text-[#1F5E4B] font-semibold">Ready for Q&amp;A</span>
          </div>
        </div>

        {/* PANEL 2: CENTER AI CHAT PANEL */}
        <div
          className={`flex-1 flex flex-col bg-[#F7F8F6] min-w-0
            ${mobileActivePanel === 'chat' ? 'flex' : 'hidden lg:flex'}`}
        >
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRegenerate={() => handleSendMessage(messages[messages.length - 2]?.text || 'Clarify the last topic')}
                />
              ))
            ) : (
              /* Empty Chat State */
              <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F2EE] border border-[#D8E9E2] text-[#1F5E4B] flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#17211D]">
                  Ask anything about your sources
                </h3>
                <p className="text-xs sm:text-sm text-[#6B756F] leading-relaxed">
                  Upload your materials and start exploring your knowledge. Every answer is grounded directly in your uploaded notes.
                </p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Container */}
          <div className="p-4 sm:p-6 pt-2 bg-gradient-to-t from-[#F7F8F6] via-[#F7F8F6] to-transparent shrink-0 max-w-4xl w-full mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              onAttachSource={() => setAddSourceOpen(true)}
              sourceCount={sources.length}
            />
          </div>
        </div>

        {/* PANEL 3: RIGHT STUDY STUDIO TOOLS PANEL */}
        <div
          className={`bg-white border-l border-[#E2E7E3] flex flex-col transition-all duration-200 shrink-0
            ${rightPanelCollapsed ? 'w-0 hidden' : 'w-72 sm:w-80 lg:w-84'}
            ${mobileActivePanel === 'tools' ? 'flex w-full absolute inset-0 z-20 pt-16 bg-white' : 'hidden lg:flex'}`}
        >
          <div className="flex-1 overflow-y-auto p-4">
            <StudyToolsPanel notebookTitle={notebook.title} />
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={addSourceOpen}
        onClose={() => setAddSourceOpen(false)}
        onAddSource={handleAddSource}
      />

      {/* Source Excerpt / Summary Modal */}
      <Modal
        isOpen={Boolean(selectedSourceSnippet)}
        onClose={() => setSelectedSourceSnippet(null)}
        title={selectedSourceSnippet?.title || 'Source Excerpt'}
        description={`Indexed document metadata (${selectedSourceSnippet?.type?.toUpperCase()})`}
        footer={
          <Button variant="primary" onClick={() => setSelectedSourceSnippet(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#17211D]">
          <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] space-y-1">
            <p className="font-semibold text-[#1F5E4B]">Document Details:</p>
            <p className="text-[#6B756F]">Type: {selectedSourceSnippet?.type} • Size: {selectedSourceSnippet?.size} {selectedSourceSnippet?.pages ? `• ${selectedSourceSnippet?.pages} pages` : ''}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#D8E9E2] space-y-2">
            <p className="font-bold text-xs text-[#17211D]">Extracted Knowledge Summary:</p>
            <p className="text-[#6B756F] italic leading-relaxed">
              "{selectedSourceSnippet?.snippet || 'Content successfully extracted and indexed into high-dimensional vector representations.'}"
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
