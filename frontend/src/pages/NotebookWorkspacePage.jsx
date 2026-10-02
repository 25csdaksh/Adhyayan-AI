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
  ChevronDown,
  Quote,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Dropdown, DropdownItem, DropdownDivider } from '../components/ui/Dropdown';
import { SourceCard } from '../components/sources/SourceCard';
import { AddSourceModal } from '../components/sources/AddSourceModal';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { StudyToolsPanel } from '../components/study/StudyToolsPanel';
import { notebookService } from '../api/notebookService';
import { documentService } from '../api/documentService';
import { chatService } from '../api/chatService';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';
import { DeleteSourceModal } from '../components/sources/DeleteSourceModal';
import { Skeleton } from '../components/ui/Skeleton';

export const NotebookWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);

  // Chat State
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [citationPreview, setCitationPreview] = useState(null);

  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [isDeletingSource, setIsDeletingSource] = useState(false);
  const [selectedSourceSnippet, setSelectedSourceSnippet] = useState(null);

  // Responsive workspace tab state for tablet & mobile
  const [mobileActivePanel, setMobileActivePanel] = useState('chat'); // 'sources' | 'chat' | 'tools'
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load Notebook & Sources
  const fetchWorkspaceData = async (isMounted) => {
    setLoading(true);
    setSourcesLoading(true);
    setError(null);
    try {
      const [nbRes, docsRes, chatsRes] = await Promise.all([
        notebookService.getNotebook(id),
        documentService.getDocuments(id),
        chatService.getChatSessions(id).catch(() => ({ data: { sessions: [] } })),
      ]);

      if (isMounted) {
        if (nbRes?.data?.notebook) {
          setNotebook(nbRes.data.notebook);
        } else {
          setError('Notebook not found or you do not have permission to view it.');
        }

        if (docsRes?.data?.documents) {
          setSources(docsRes.data.documents);
        }

        const sessions = chatsRes?.data?.sessions || [];
        setChatSessions(sessions);

        if (sessions.length > 0) {
          setActiveSessionId(sessions[0]._id);
        } else {
          // Auto-create initial default chat session
          try {
            const newSessionRes = await chatService.createChatSession(id, { title: 'New Chat' });
            if (newSessionRes?.data?.session) {
              setChatSessions([newSessionRes.data.session]);
              setActiveSessionId(newSessionRes.data.session._id);
            }
          } catch (createErr) {
            console.warn('Failed to auto-create default chat session:', createErr.message);
          }
        }
      }
    } catch (err) {
      if (isMounted) {
        const errMsg =
          err?.response?.data?.message || err?.message || 'Failed to load workspace. Please try again.';
        setError(errMsg);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setSourcesLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (id) {
      fetchWorkspaceData(isMounted);
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load messages when activeSessionId changes
  useEffect(() => {
    let isMounted = true;
    if (!id || !activeSessionId) return;

    const loadMessages = async () => {
      setChatLoading(true);
      try {
        const res = await chatService.getChatMessages(id, activeSessionId);
        if (isMounted && res?.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Failed to load chat history', 'Chat Error');
        }
      } finally {
        if (isMounted) {
          setChatLoading(false);
        }
      }
    };

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [id, activeSessionId]);

  // Periodic polling when any source is pending or processing
  const hasProcessingSources = sources.some(
    (s) => s.status === 'pending' || s.status === 'processing'
  );

  useEffect(() => {
    if (!id || !hasProcessingSources) return;

    const interval = setInterval(async () => {
      try {
        const docsRes = await documentService.getDocuments(id);
        if (docsRes?.data?.documents) {
          setSources(docsRes.data.documents);
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, hasProcessingSources]);

  const handleAddSourceSuccess = (newDoc) => {
    if (newDoc) {
      setSources((prev) => [newDoc, ...prev]);
    }
  };

  const handleDeleteSourceClick = (source) => {
    setSourceToDelete(source);
  };

  const handleConfirmDeleteSource = async (source) => {
    if (!source || !source._id) return;
    setIsDeletingSource(true);
    try {
      await documentService.deleteDocument(id, source._id);
      setSources((prev) => prev.filter((s) => s._id !== source._id));
      toast.success(`Removed source "${source.title}"`, 'Source Deleted');
      setSourceToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete source', 'Delete Error');
    } finally {
      setIsDeletingSource(false);
    }
  };

  const handleReprocessSource = async (source) => {
    if (!source || !source._id) return;
    try {
      await documentService.reprocessDocument(id, source._id);
      setSources((prev) =>
        prev.map((s) => (s._id === source._id ? { ...s, status: 'processing', processingError: '' } : s))
      );
      toast.info(`Processing restarted for "${source.title}"`, 'Reprocessing');
    } catch (err) {
      toast.error(err.message || 'Failed to restart processing', 'Error');
    }
  };

  // Create a new fresh chat session
  const handleNewChat = async () => {
    try {
      const res = await chatService.createChatSession(id, { title: 'New Chat' });
      if (res?.data?.session) {
        setChatSessions((prev) => [res.data.session, ...prev]);
        setActiveSessionId(res.data.session._id);
        setMessages([]);
        toast.success('New chat session started', 'Chat Created');
      }
    } catch (err) {
      toast.error('Failed to create new chat session', 'Error');
    }
  };

  // Delete current chat session
  const handleDeleteChat = async (sessionId) => {
    if (!sessionId) return;
    try {
      await chatService.deleteChatSession(id, sessionId);
      const remaining = chatSessions.filter((s) => s._id !== sessionId);
      setChatSessions(remaining);
      toast.info('Chat session deleted', 'Chat Deleted');

      if (remaining.length > 0) {
        setActiveSessionId(remaining[0]._id);
      } else {
        handleNewChat();
      }
    } catch (err) {
      toast.error('Failed to delete chat session', 'Error');
    }
  };

  // Send message and get grounded RAG answer
  const handleSendMessage = async (userQuery) => {
    if (!userQuery || !userQuery.trim() || isSending) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      try {
        const newSessionRes = await chatService.createChatSession(id, { title: 'New Chat' });
        targetSessionId = newSessionRes.data.session._id;
        setChatSessions([newSessionRes.data.session]);
        setActiveSessionId(targetSessionId);
      } catch (err) {
        toast.error('Failed to initialize chat session', 'Error');
        return;
      }
    }

    const optimisticUserMsg = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: userQuery.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsSending(true);

    try {
      const res = await chatService.sendMessage(id, targetSessionId, { message: userQuery.trim() });
      if (res?.data?.assistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== optimisticUserMsg._id),
          res.data.userMessage || optimisticUserMsg,
          res.data.assistantMessage,
        ]);

        if (res.data.session?.title) {
          setChatSessions((prev) =>
            prev.map((s) => (s._id === targetSessionId ? { ...s, title: res.data.session.title } : s))
          );
        }
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Failed to generate grounded AI answer.';
      toast.error(errMsg, 'RAG Error');

      // Add assistant error fallback message
      const errorMsg = {
        _id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Unable to generate response**: ${errMsg}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const activeSession = chatSessions.find((s) => s._id === activeSessionId) || chatSessions[0];

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
          {/* Chat Sessions Dropdown */}
          {chatSessions.length > 0 && (
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-[#E2E7E3] hover:border-[#1F5E4B] text-xs font-semibold text-[#17211D] bg-white flex items-center gap-1.5 transition-colors cursor-pointer max-w-[180px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#1F5E4B]" />
                  <span className="truncate">{activeSession?.title || 'Chat History'}</span>
                  <ChevronDown className="w-3 h-3 text-[#8E9993]" />
                </button>
              }
            >
              <div className="px-3 py-1 text-[10px] font-bold text-[#8E9993] uppercase tracking-wider">
                Notebook Chats
              </div>
              {chatSessions.map((session) => (
                <DropdownItem
                  key={session._id}
                  icon={MessageSquare}
                  onClick={() => setActiveSessionId(session._id)}
                  className={session._id === activeSessionId ? 'font-bold text-[#1F5E4B] bg-[#E8F2EE]' : ''}
                >
                  <span className="truncate">{session.title}</span>
                </DropdownItem>
              ))}
              <DropdownDivider />
              <DropdownItem icon={Plus} onClick={handleNewChat}>
                New Chat Thread
              </DropdownItem>
              {activeSessionId && (
                <DropdownItem
                  icon={Trash2}
                  danger
                  onClick={() => handleDeleteChat(activeSessionId)}
                >
                  Delete Current Chat
                </DropdownItem>
              )}
            </Dropdown>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={Plus}
            onClick={handleNewChat}
            title="Start new chat thread"
          >
            New Chat
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setAddSourceOpen(true)}
          >
            Add Source
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
            {sourcesLoading ? (
              <div className="space-y-2.5">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : sources.length > 0 ? (
              sources.map((source) => (
                <SourceCard
                  key={source._id || source.id}
                  source={source}
                  onRemove={handleDeleteSourceClick}
                  onReprocess={handleReprocessSource}
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
                  Add PDFs, documents, notes, or web sources to start building your research notebook.
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
            <span>Storage: Cloudinary</span>
            <span className="text-[#1F5E4B] font-semibold">{sources.length} Active</span>
          </div>
        </div>

        {/* PANEL 2: CENTER AI CHAT PANEL */}
        <div
          className={`flex-1 flex flex-col bg-[#F7F8F6] min-w-0
            ${mobileActivePanel === 'chat' ? 'flex' : 'hidden lg:flex'}`}
        >
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
            {chatLoading ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-20 w-3/4 rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <ChatMessage
                  key={msg._id || msg.id}
                  message={msg}
                  onCitationClick={(cit) => setCitationPreview(cit)}
                  onRegenerate={() => {
                    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                    if (lastUserMsg) {
                      handleSendMessage(lastUserMsg.content || lastUserMsg.text);
                    }
                  }}
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
                  Upload your materials and start exploring your knowledge. Every answer is grounded directly in your uploaded notes with verifiable citations.
                </p>
              </div>
            )}

            {/* Generating response loader state */}
            {isSending && (
              <div className="flex gap-3 sm:gap-4 py-4 px-3 sm:px-5 rounded-2xl bg-white border border-[#E2E7E3] shadow-2xs animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-[#1F5E4B] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#17211D]">StudyLM AI</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F2EE] text-[#1F5E4B] flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Grounding in notebook sources...
                    </span>
                  </div>
                  <div className="h-3.5 bg-[#F2F5F3] rounded w-5/6" />
                  <div className="h-3.5 bg-[#F2F5F3] rounded w-2/3" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Container */}
          <div className="p-4 sm:p-6 pt-2 bg-gradient-to-t from-[#F7F8F6] via-[#F7F8F6] to-transparent shrink-0 max-w-4xl w-full mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isSending}
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
        notebookId={id}
        onSourceAdded={handleAddSourceSuccess}
      />

      {/* Delete Source Confirmation Modal */}
      <DeleteSourceModal
        isOpen={Boolean(sourceToDelete)}
        onClose={() => setSourceToDelete(null)}
        onConfirm={handleConfirmDeleteSource}
        source={sourceToDelete}
        isDeleting={isDeletingSource}
      />

      {/* Citation Preview Modal */}
      <Modal
        isOpen={Boolean(citationPreview)}
        onClose={() => setCitationPreview(null)}
        title={citationPreview?.documentTitle || 'Grounded Citation'}
        description={`Source reference [${citationPreview?.citationNumber || 1}] • ${
          citationPreview?.pageNumber ? `Page ${citationPreview.pageNumber}` : citationPreview?.sourceType?.toUpperCase() || 'Source Document'
        }`}
        footer={
          <Button variant="primary" onClick={() => setCitationPreview(null)}>
            Close Preview
          </Button>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm text-[#17211D]">
          <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#E2E7E3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1F5E4B]" />
              <span className="font-semibold text-[#17211D]">{citationPreview?.documentTitle}</span>
            </div>
            <Badge variant="forest" size="sm">
              {citationPreview?.pageNumber ? `Page ${citationPreview.pageNumber}` : `${citationPreview?.sourceType || 'Text'} Source`}
            </Badge>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#D8E9E2] space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F5E4B]">
              <Quote className="w-3.5 h-3.5" /> Grounded Passage Excerpt:
            </div>
            <p className="text-[#17211D] text-xs sm:text-sm leading-relaxed border-l-3 border-[#1F5E4B] pl-3 py-1 italic bg-[#FAFBF9] rounded-r-lg">
              "{citationPreview?.snippet || 'Verifiable source text content extracted during document indexing.'}"
            </p>
          </div>
        </div>
      </Modal>

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
