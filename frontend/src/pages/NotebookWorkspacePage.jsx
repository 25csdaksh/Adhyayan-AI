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
  Search,
  Brain,
  Bookmark,
  GitCompare,
  Clock,
  Compass,
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
import { webSourceService } from '../api/webSourceService';
import { WebSourceCard } from '../components/sources/WebSourceCard';
import { AddWebSourceModal } from '../components/sources/AddWebSourceModal';
import { ResearchPanel } from '../components/research/ResearchPanel';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';
import { DeleteSourceModal } from '../components/sources/DeleteSourceModal';
import { Skeleton } from '../components/ui/Skeleton';
import { Globe } from 'lucide-react';
import { SourceSummaryModal } from '../components/sources/SourceSummaryModal';

// Phase 13 Components
import { SourcePreviewModal } from '../components/sources/SourcePreviewModal';
import { SavedInsightsPanel } from '../components/insights/SavedInsightsPanel';
import { SourceRelationshipsPanel } from '../components/relationships/SourceRelationshipsPanel';
import { KnowledgeOverviewPanel } from '../components/overview/KnowledgeOverviewPanel';
import { ActivityTimelinePanel } from '../components/activity/ActivityTimelinePanel';
import { UniversalSearchModal } from '../components/search/UniversalSearchModal';
import { MemoryManagementModal } from '../components/memory/MemoryManagementModal';
import { insightService } from '../api/insightService';


export const NotebookWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [webSourcesLoading, setWebSourcesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [webSources, setWebSources] = useState([]);
  const [activeSourceTab, setActiveSourceTab] = useState('all'); // 'all' | 'documents' | 'web'
  const [activeStudioTab, setActiveStudioTab] = useState('study'); // 'study' | 'research' | 'overview' | 'insights' | 'relationships' | 'activity'

  // Chat State
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [citationPreview, setCitationPreview] = useState(null);

  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [addWebSourceOpen, setAddWebSourceOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [isDeletingSource, setIsDeletingSource] = useState(false);
  const [refreshingWebSourceId, setRefreshingWebSourceId] = useState(null);
  const [selectedSourceSnippet, setSelectedSourceSnippet] = useState(null);
  const [summaryModalDoc, setSummaryModalDoc] = useState(null);

  // Phase 13 Modals
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);

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

  // Load Notebook, Sources & Web Sources
  const fetchWorkspaceData = async (isMounted) => {
    setLoading(true);
    setSourcesLoading(true);
    setWebSourcesLoading(true);
    setError(null);
    try {
      const [nbRes, docsRes, webRes, chatsRes] = await Promise.all([
        notebookService.getNotebook(id),
        documentService.getDocuments(id),
        webSourceService.getWebSources(id).catch(() => ({ data: { webSources: [] } })),
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

        if (webRes?.data?.webSources) {
          setWebSources(webRes.data.webSources);
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
        setWebSourcesLoading(false);
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
  const hasProcessingSources =
    sources.some((s) => s.status === 'pending' || s.status === 'processing') ||
    webSources.some((w) => w.status === 'pending' || w.status === 'processing');

  useEffect(() => {
    if (!id || !hasProcessingSources) return;

    const interval = setInterval(async () => {
      try {
        const [docsRes, webRes] = await Promise.all([
          documentService.getDocuments(id),
          webSourceService.getWebSources(id).catch(() => null),
        ]);
        if (docsRes?.data?.documents) {
          setSources(docsRes.data.documents);
        }
        if (webRes?.data?.webSources) {
          setWebSources(webRes.data.webSources);
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

  const handleAddWebSourceSuccess = (newWebSource) => {
    if (newWebSource) {
      setWebSources((prev) => [newWebSource, ...prev]);
      toast.success('Web source added and processed!', 'Source Added');
    }
  };

  const handleDeleteWebSource = async (webSourceId) => {
    if (!webSourceId) return;
    try {
      await webSourceService.deleteWebSource(id, webSourceId);
      setWebSources((prev) => prev.filter((w) => w._id !== webSourceId));
      toast.success('Web source removed', 'Deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete web source', 'Error');
    }
  };

  const handleRefreshWebSource = async (webSourceId) => {
    if (!webSourceId) return;
    setRefreshingWebSourceId(webSourceId);
    try {
      const res = await webSourceService.refreshWebSource(id, webSourceId);
      if (res?.data) {
        setWebSources((prev) => prev.map((w) => (w._id === webSourceId ? res.data : w)));
        toast.success('Web source re-fetched & re-indexed!', 'Refreshed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to refresh web source', 'Error');
    } finally {
      setRefreshingWebSourceId(null);
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

  // Quick save insight from chat message
  const handleSaveInsightFromMessage = async (msg) => {
    try {
      const title = (msg.content || '').slice(0, 48).trim() + '...';
      await insightService.createSavedInsight(id, {
        title: title || 'Saved Insight',
        content: msg.content,
        sourceReferences: msg.citations || [],
        tags: ['chat-insight'],
      });
      toast.success('Response saved to Notebook Insights!', 'Insight Saved');
    } catch (err) {
      toast.error('Failed to save insight', 'Error');
    }
  };

  // Quick bookmark chat message
  const handleBookmarkMessage = async (msg) => {
    try {
      await insightService.createBookmark(id, {
        targetType: 'chat',
        targetId: msg._id,
        title: (msg.content || '').slice(0, 50),
      });
      toast.success('Message bookmarked!', 'Bookmarked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bookmark message', 'Error');
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
    <div className="flex flex-col h-screen w-screen bg-[#F8FAF8] overflow-hidden select-none text-[#17211D]">
      {/* Workspace Unified Top Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#E2E7E3] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-10 shadow-2xs">
        {/* Left: Brand, Back, Title, Status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-xl transition-all flex items-center gap-1 text-xs font-semibold"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-5 w-px bg-[#E2E7E3] hidden sm:block" />

          {/* Logo & Breadcrumb */}
          <Link to="/dashboard" className="hidden sm:flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#1F5E4B] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-[#17211D] tracking-tight">Adhyayan-AI</span>
          </Link>

          <span className="text-[#8E9993] hidden sm:inline">/</span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#17211D] truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                {notebook.title}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2EE] text-[#1F5E4B] border border-[#D8E9E2] flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E4B] animate-pulse" />
                {sources.length + webSources.length} {sources.length + webSources.length === 1 ? 'source' : 'sources'} active
              </span>
            </div>
          </div>
        </div>

        {/* Center: Universal Search & Research Memory */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUniversalSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] text-xs font-semibold text-[#6B756F] hover:text-[#17211D] bg-[#F7F8F6] hover:bg-white transition-all cursor-pointer shadow-2xs"
            title="Universal Notebook Search"
          >
            <Search className="w-3.5 h-3.5 text-[#1F5E4B]" />
            <span>Search Notebook</span>
            <kbd className="text-[10px] px-1.5 py-0.5 bg-white border border-[#E2E7E3] rounded text-[#8E9993] font-mono">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={() => setMemoryModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] text-xs font-semibold text-[#1F5E4B] bg-[#E8F2EE]/70 hover:bg-[#D8E9E2] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Research Memory & Directives"
          >
            <Brain className="w-3.5 h-3.5 text-[#1F5E4B]" />
            <span>Memory</span>
          </button>

          {/* Panel collapse controls for Desktop */}
          <div className="flex items-center gap-1 text-[#8E9993] border-l border-[#E2E7E3] pl-2">
            <button
              type="button"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="p-1.5 hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
              title={leftPanelCollapsed ? 'Show Sources' : 'Collapse Sources'}
            >
              {leftPanelCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4 text-[#1F5E4B]" />}
            </button>
            <button
              type="button"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="p-1.5 hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-lg transition-colors cursor-pointer"
              title={rightPanelCollapsed ? 'Show Knowledge Studio' : 'Collapse Knowledge Studio'}
            >
              {rightPanelCollapsed ? <PanelRight className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4 text-[#1F5E4B]" />}
            </button>
          </div>
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
            Sources ({sources.length + webSources.length})
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
            Studio
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Chat Sessions Dropdown */}
          {chatSessions.length > 0 && (
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] text-xs font-semibold text-[#17211D] bg-white flex items-center gap-1.5 transition-colors cursor-pointer max-w-[170px]"
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

          <button
            type="button"
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-xl border border-[#E2E7E3] hover:border-[#1F5E4B] text-xs font-semibold text-[#4A5550] hover:text-[#17211D] bg-white hover:bg-[#FAFBF9] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Start new chat thread"
          >
            <Plus className="w-3.5 h-3.5 text-[#1F5E4B]" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setAddWebSourceOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Add Web</span>
          </button>

          <button
            type="button"
            onClick={() => setAddSourceOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1F5E4B] to-[#164E3D] text-white hover:opacity-95 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shadow-[#1F5E4B]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Doc</span>
          </button>
        </div>
      </div>

      {/* Main 3-Panel Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: LEFT SOURCES PANEL */}
        <div
          className={`bg-white border-r border-[#E2E7E3] flex flex-col transition-all duration-200 shrink-0
            ${leftPanelCollapsed ? 'w-0 hidden' : 'w-76 sm:w-80'}
            ${mobileActivePanel === 'sources' ? 'flex w-full absolute inset-0 z-20 pt-16 bg-white' : 'hidden lg:flex'}`}
        >
          {/* Sources Header */}
          <div className="p-3.5 border-b border-[#EDF1EE] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#1F5E4B]" />
                  Sources ({sources.length + webSources.length})
                </h2>
                <p className="text-[11px] text-[#6B756F]">Active grounded knowledge</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAddWebSourceOpen(true)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Add Web Source"
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAddSourceOpen(true)}
                  className="p-1.5 text-[#1F5E4B] hover:bg-[#E8EFEA] rounded-lg transition-colors cursor-pointer"
                  title="Add Document"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Source Category Tabs */}
            <div className="flex items-center p-0.5 bg-[#F2F5F3] rounded-lg text-[11px] font-semibold text-[#6B756F]">
              <button
                type="button"
                onClick={() => setActiveSourceTab('all')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  activeSourceTab === 'all'
                    ? 'bg-white text-[#17211D] shadow-2xs font-bold'
                    : 'hover:text-[#17211D]'
                }`}
              >
                All ({sources.length + webSources.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSourceTab('documents')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  activeSourceTab === 'documents'
                    ? 'bg-white text-[#1F5E4B] shadow-2xs font-bold'
                    : 'hover:text-[#17211D]'
                }`}
              >
                Docs ({sources.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSourceTab('web')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  activeSourceTab === 'web'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'hover:text-[#17211D]'
                }`}
              >
                Web ({webSources.length})
              </button>
            </div>
          </div>

          {/* Source Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {sourcesLoading || webSourcesLoading ? (
              <div className="space-y-2.5">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : (sources.length > 0 || webSources.length > 0) ? (
              <>
                {/* Documents section */}
                {(activeSourceTab === 'all' || activeSourceTab === 'documents') &&
                  sources.map((source) => (
                    <SourceCard
                      key={source._id || source.id}
                      source={source}
                      onRemove={handleDeleteSourceClick}
                      onReprocess={handleReprocessSource}
                      onViewDetails={(s) => setSummaryModalDoc(s)}
                      onViewSnippet={(s) => setSelectedSourceSnippet(s)}
                    />
                  ))}

                {/* Web Sources section */}
                {(activeSourceTab === 'all' || activeSourceTab === 'web') &&
                  webSources.map((webSource) => (
                    <WebSourceCard
                      key={webSource._id || webSource.id}
                      webSource={webSource}
                      isRefreshing={refreshingWebSourceId === (webSource._id || webSource.id)}
                      onRefresh={handleRefreshWebSource}
                      onDelete={handleDeleteWebSource}
                    />
                  ))}
              </>
            ) : (
              <div className="text-center py-12 px-4 text-xs text-[#6B756F] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-[#17211D]">No sources yet</p>
                <p className="text-xs text-[#6B756F] leading-relaxed max-w-xs mx-auto">
                  Add PDFs, notes, or web articles to build your grounded research base.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={Globe}
                    onClick={() => setAddWebSourceOpen(true)}
                  >
                    Add Web
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Plus}
                    onClick={() => setAddSourceOpen(true)}
                  >
                    Add Doc
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sources Footer Summary */}
          <div className="p-3 bg-[#FAFBF9] border-t border-[#EDF1EE] text-[11px] text-[#6B756F] flex items-center justify-between shrink-0">
            <span>{sources.length} Docs • {webSources.length} Web</span>
            <span className="text-[#1F5E4B] font-semibold">{sources.length + webSources.length} Active</span>
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
                  onSaveInsight={handleSaveInsightFromMessage}
                  onBookmark={handleBookmarkMessage}
                  onRegenerate={() => {
                    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                    if (lastUserMsg) {
                      handleSendMessage(lastUserMsg.content || lastUserMsg.text);
                    }
                  }}
                />
              ))
            ) : (
              /* Empty Chat State - Premium Interactive Prompt Cards */
              <div className="min-h-[55vh] flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1F5E4B] to-[#144234] text-white flex items-center justify-center shadow-lg shadow-[#1F5E4B]/20">
                  <Sparkles className="w-7 h-7" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-[#17211D] tracking-tight">
                    Explore Your Research Materials
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B756F] leading-relaxed max-w-md mx-auto">
                    Every response is strictly grounded in your active documents and web sources with verified citations.
                  </p>
                </div>

                {/* 4 Interactive Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('Please provide a structured executive summary of all uploaded sources with key takeaways and important concepts.')}
                    className="p-3.5 bg-white/95 hover:bg-[#FAFBF9] border border-[#E2E7E3] hover:border-[#1F5E4B] rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 group space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors">
                        Executive Summary
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B756F] line-clamp-2">
                      Synthesize key takeaways and core concepts across sources.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Create 5 multiple choice practice questions based on the key concepts in my sources, with answer explanations.')}
                    className="p-3.5 bg-white/95 hover:bg-[#FAFBF9] border border-[#E2E7E3] hover:border-[#1F5E4B] rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 group space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors">
                        Practice Quiz
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B756F] line-clamp-2">
                      Test your understanding with 5 grounded MCQs and explanations.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Generate an active recall study outline with core terms and definitions from my materials.')}
                    className="p-3.5 bg-white/95 hover:bg-[#FAFBF9] border border-[#E2E7E3] hover:border-[#1F5E4B] rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 group space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors">
                        Study Flashcards
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B756F] line-clamp-2">
                      Build rapid recall decks covering formulas and definitions.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Compare and contrast the primary arguments, methodologies, and findings presented in the sources.')}
                    className="p-3.5 bg-white/95 hover:bg-[#FAFBF9] border border-[#E2E7E3] hover:border-[#1F5E4B] rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 group space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <GitCompare className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors">
                        Compare & Contrast
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B756F] line-clamp-2">
                      Cross-analyze definitions, pros & cons, and methodologies.
                    </p>
                  </button>
                </div>
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
                    <span className="text-xs font-bold text-[#17211D]">Adhyayan-AI</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F2EE] text-[#1F5E4B] flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Grounding in sources & memory...
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
              sourceCount={sources.length + webSources.length}
            />
          </div>
        </div>

        {/* PANEL 3: RIGHT KNOWLEDGE STUDIO / TOOLS PANEL */}
        <div
          className={`bg-white border-l border-[#E2E7E3] flex flex-col transition-all duration-200 shrink-0
            ${rightPanelCollapsed ? 'w-0 hidden' : 'w-80 sm:w-88 lg:w-96'}
            ${mobileActivePanel === 'tools' ? 'flex w-full absolute inset-0 z-20 pt-16 bg-white' : 'hidden lg:flex'}`}
        >
          {/* Studio Tab Switcher - Phase 13 Multi-section Navigation */}
          <div className="p-2 border-b border-[#EDF1EE] bg-[#FAFBF9] shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              <button
                type="button"
                onClick={() => setActiveStudioTab('overview')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStudioTab === 'overview'
                    ? 'bg-white text-[#1F5E4B] shadow-2xs border border-[#E2E7E3]'
                    : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
                title="Knowledge Overview & Recommendations"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#1F5E4B]" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudioTab('study')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStudioTab === 'study'
                    ? 'bg-white text-[#1F5E4B] shadow-2xs border border-[#E2E7E3]'
                    : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" />
                <span>Study</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudioTab('research')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStudioTab === 'research'
                    ? 'bg-white text-blue-700 shadow-2xs border border-[#E2E7E3]'
                    : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Research</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudioTab('insights')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStudioTab === 'insights'
                    ? 'bg-white text-emerald-700 shadow-2xs border border-[#E2E7E3]'
                    : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
                title="Saved Insights"
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                <span>Insights</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudioTab('relationships')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStudioTab === 'relationships'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-[#E2E7E3]'
                    : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
                title="Source Relationships"
              >
                <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Relations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudioTab('activity')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeStudioTab === 'activity'
                    ? 'bg-white text-amber-700 shadow-2xs border border-[#E2E7E3]'
                    : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
                title="Activity Timeline"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Timeline</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeStudioTab === 'overview' && (
              <KnowledgeOverviewPanel
                notebookId={id}
                onNavigateTab={(tab) => setActiveStudioTab(tab)}
              />
            )}

            {activeStudioTab === 'study' && (
              <StudyToolsPanel
                notebookId={id}
                notebookTitle={notebook?.title}
                onSelectCitation={(cit) => setCitationPreview(cit)}
              />
            )}

            {activeStudioTab === 'research' && (
              <ResearchPanel
                notebookId={id}
                onSelectCitation={(cit) => setCitationPreview(cit)}
              />
            )}

            {activeStudioTab === 'insights' && (
              <SavedInsightsPanel
                notebookId={id}
                onCitationClick={(cit) => setCitationPreview(cit)}
              />
            )}

            {activeStudioTab === 'relationships' && (
              <SourceRelationshipsPanel
                notebookId={id}
                onSelectSource={(s) => setSummaryModalDoc(s)}
              />
            )}

            {activeStudioTab === 'activity' && (
              <ActivityTimelinePanel
                notebookId={id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Document Source Modal */}
      <AddSourceModal
        isOpen={addSourceOpen}
        onClose={() => setAddSourceOpen(false)}
        notebookId={id}
        onSourceAdded={handleAddSourceSuccess}
      />

      {/* Add Web Source Modal */}
      <AddWebSourceModal
        isOpen={addWebSourceOpen}
        onClose={() => setAddWebSourceOpen(false)}
        notebookId={id}
        onSourceAdded={handleAddWebSourceSuccess}
      />

      {/* Delete Source Confirmation Modal */}
      <DeleteSourceModal
        isOpen={Boolean(sourceToDelete)}
        onClose={() => setSourceToDelete(null)}
        onConfirm={handleConfirmDeleteSource}
        source={sourceToDelete}
        isDeleting={isDeletingSource}
      />

      {/* Phase 13 Source Preview Modal (Citation Deep Linking & Chunk Surrounds) */}
      <SourcePreviewModal
        isOpen={Boolean(citationPreview)}
        onClose={() => setCitationPreview(null)}
        notebookId={id}
        citation={citationPreview}
      />

      {/* Phase 13 Universal Notebook Search Modal */}
      <UniversalSearchModal
        isOpen={universalSearchOpen}
        onClose={() => setUniversalSearchOpen(false)}
        notebookId={id}
        onSelectResult={(item) => {
          if (item.category === 'insights') {
            setActiveStudioTab('insights');
          } else if (item.category === 'sources') {
            setSelectedSourceSnippet({
              title: item.title,
              type: item.type || 'document',
              snippet: item.snippet,
            });
          }
        }}
      />

      {/* Phase 13 Research Memory Management Modal */}
      <MemoryManagementModal
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        notebookId={id}
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

      {/* Structured Source Intelligence & Summary Modal */}
      <SourceSummaryModal
        isOpen={Boolean(summaryModalDoc)}
        onClose={() => setSummaryModalDoc(null)}
        document={summaryModalDoc}
        notebookId={id}
        onAskQuestion={(q) => handleSendMessage(q)}
      />
    </div>
  );
};
