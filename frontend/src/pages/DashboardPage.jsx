import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Clock,
  FolderPlus,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Brain,
  Layers,
  FileText,
  FileQuestion,
  Network,
  Cpu,
  Database,
  ArrowRight,
  Zap,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { NotebookCard } from '../components/notebooks/NotebookCard';
import { CreateNotebookModal } from '../components/notebooks/CreateNotebookModal';
import { EditNotebookModal } from '../components/notebooks/EditNotebookModal';
import { DeleteNotebookModal } from '../components/notebooks/DeleteNotebookModal';
import { notebookService } from '../api/notebookService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';

export const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { user } = useAuth();
  const toast = useToast();

  const [notebooks, setNotebooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');

  // Onboarding Modal state
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (user && user.onboardingCompleted === false) {
      setOnboardingOpen(true);
    }
  }, [user]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [editingNotebook, setEditingNotebook] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingNotebook, setDeletingNotebook] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Researcher';

  // Fetch notebooks with search and pagination
  const fetchNotebooks = useCallback(async (search = '', page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notebookService.getNotebooks({ search, page, limit: 24 });
      setNotebooks(response.data.notebooks || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Unable to load notebooks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotebooks(searchQuery, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchNotebooks]);

  // Create Notebook Handler
  const handleCreateNotebook = async (data) => {
    setIsCreating(true);
    try {
      const res = await notebookService.createNotebook(data);
      const newNb = res.data.notebook;
      setNotebooks((prev) => [newNb, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      toast.success(`Notebook "${newNb.title}" initialized successfully!`, 'Notebook Ready');
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create notebook.');
    } finally {
      setIsCreating(false);
    }
  };

  // Quick Starter Templates
  const starterTemplates = [
    {
      title: 'Computer Networks & Security',
      description: 'OSI 7-Layer Architecture, TCP/UDP protocols, and network cryptography.',
      icon: Network,
      category: 'Computer Science',
    },
    {
      title: 'AI & Machine Learning Foundations',
      description: 'Supervised learning, Transformer attention mechanisms, and gradient descent.',
      icon: Cpu,
      category: 'Artificial Intelligence',
    },
    {
      title: 'Database Systems & Architecture',
      description: 'Relational algebra, ACID transactions, indexing, and distributed databases.',
      icon: Database,
      category: 'Systems & Data',
    },
  ];

  const handleCreateFromTemplate = async (template) => {
    await handleCreateNotebook({
      title: template.title,
      description: template.description,
      icon: 'book',
    });
  };

  // Edit Notebook Handler
  const handleUpdateNotebook = async (updates) => {
    if (!editingNotebook) return;
    setIsUpdating(true);
    try {
      const id = editingNotebook._id || editingNotebook.id;
      const res = await notebookService.updateNotebook(id, updates);
      const updatedNb = res.data.notebook;
      setNotebooks((prev) =>
        prev.map((nb) => ((nb._id || nb.id) === id ? updatedNb : nb))
      );
      toast.success(`Notebook "${updatedNb.title}" updated.`, 'Saved');
      setEditingNotebook(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update notebook.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Notebook Handler
  const handleDeleteNotebook = async () => {
    if (!deletingNotebook) return;
    setIsDeleting(true);
    try {
      const id = deletingNotebook._id || deletingNotebook.id;
      await notebookService.deleteNotebook(id);
      setNotebooks((prev) => prev.filter((nb) => (nb._id || nb.id) !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      toast.success(`Notebook "${deletingNotebook.title}" deleted.`, 'Deleted');
      setDeletingNotebook(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete notebook.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate dynamic time greeting
  const getGreetingDetails = (name) => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: `Good morning, ${name}`,
        subtitle: 'Start your study session with citation-grounded research across your textbooks.',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: `Good afternoon, ${name}`,
        subtitle: 'Pick up where you left off and generate study tools across your active sources.',
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: `Good evening, ${name}`,
        subtitle: 'Synthesize lecture notes, create flashcards, and run practice quizzes tonight.',
      };
    } else {
      return {
        greeting: `Welcome back, ${name}`,
        subtitle: 'Working late tonight? Pick up right where you left off across your study materials.',
      };
    }
  };

  const { greeting, subtitle } = getGreetingDetails(displayName);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner with High-End SaaS Depth */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#132A22] to-[#1F5E4B] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800/60">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AdhyayanLM AI Studio Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {greeting}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Hallucination Guaranteed</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Isolated Vector Space</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              leftIcon={Sparkles}
              onClick={() => setOnboardingOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-md backdrop-blur-md"
            >
              Platform Tour
            </Button>

            <Button
              variant="primary"
              size="lg"
              leftIcon={Plus}
              onClick={() => setCreateModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 border-none"
            >
              New Notebook
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Key Intelligence Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspaces</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {isLoading ? '...' : pagination.total}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{pagination.total} Active</span> • Multi-document RAG
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grounding Authority</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-2">
            Strict Citations
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Zero Hallucination with page references
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Study Suite</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-2">
            4 Power Tools
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Mind Map • Quiz • Flashcards • Summary
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace Plan</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-900 mt-2">
            {(user?.plan || 'Free').toUpperCase()} TIER
          </p>
          <p className="text-xs text-slate-500 mt-1">
            High-speed Gemini AI engine active
          </p>
        </div>
      </div>

      {/* AI Superpowers Quick Launch Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Study Tools Quick Launch</span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">Instant synthesis from your sources</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            onClick={() => {
              if (notebooks.length > 0) {
                const id = notebooks[0]._id || notebooks[0].id;
                window.location.href = `/notebooks/${id}`;
              } else {
                setCreateModalOpen(true);
              }
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer group space-y-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">Mind Map Engine</h3>
            <p className="text-xs text-slate-500 leading-snug">Generate hierarchical concept maps from any PDF.</p>
          </div>

          <div
            onClick={() => {
              if (notebooks.length > 0) {
                const id = notebooks[0]._id || notebooks[0].id;
                window.location.href = `/notebooks/${id}`;
              } else {
                setCreateModalOpen(true);
              }
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group space-y-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700">Flashcards Deck</h3>
            <p className="text-xs text-slate-500 leading-snug">Active recall cards with flip-to-reveal answers.</p>
          </div>

          <div
            onClick={() => {
              if (notebooks.length > 0) {
                const id = notebooks[0]._id || notebooks[0].id;
                window.location.href = `/notebooks/${id}`;
              } else {
                setCreateModalOpen(true);
              }
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer group space-y-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700">Executive Dossier</h3>
            <p className="text-xs text-slate-500 leading-snug">Comprehensive academic summaries &amp; key concepts.</p>
          </div>

          <div
            onClick={() => {
              if (notebooks.length > 0) {
                const id = notebooks[0]._id || notebooks[0].id;
                window.location.href = `/notebooks/${id}`;
              } else {
                setCreateModalOpen(true);
              }
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all duration-200 cursor-pointer group space-y-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileQuestion className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700">Practice Quiz</h3>
            <p className="text-xs text-slate-500 leading-snug">Exam-grade tests with instant feedback &amp; citations.</p>
          </div>
        </div>
      </div>

      {/* Main Section: Search, Filters & Notebooks Grid */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Your Notebooks ({pagination.total})</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Input
                placeholder="Search notebooks..."
                leftIcon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 bg-white"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={Plus}
              onClick={() => setCreateModalOpen(true)}
              className="shrink-0 font-semibold"
            >
              New
            </Button>
          </div>
        </div>

        {/* Content Display: Loading, Error, or Notebook Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3 max-w-lg mx-auto">
            <AlertCircle className="w-7 h-7 text-rose-600 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => fetchNotebooks(searchQuery, 1)}
            >
              Retry Connection
            </Button>
          </div>
        ) : notebooks.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {notebooks.map((nb) => (
                <NotebookCard
                  key={nb._id || nb.id}
                  notebook={nb}
                  onEdit={(target) => setEditingNotebook(target)}
                  onDelete={(target) => setDeletingNotebook(target)}
                />
              ))}
            </div>

            {/* Quick Starter Templates Gallery */}
            <div className="pt-6 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Curated Academic Starter Templates</span>
                </h3>
                <span className="text-xs text-slate-400">Click any template to instantiate instantly</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {starterTemplates.map((tpl, i) => {
                  const TplIcon = tpl.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => handleCreateFromTemplate(tpl)}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {tpl.category}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TplIcon className="w-4 h-4" />
                          </div>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                          {tpl.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between text-xs font-semibold text-emerald-700">
                        <span>+ Initialize Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <EmptyState
              icon={FolderPlus}
              title={searchQuery ? 'No matching notebooks found' : 'No notebooks yet'}
              description={
                searchQuery
                  ? `No notebooks match "${searchQuery}". Try a different search term or clear the filter.`
                  : 'Create your first notebook or select a starter template below to begin your source-grounded research.'
              }
              actionLabel={searchQuery ? 'Clear Search' : '+ Create First Notebook'}
              onAction={searchQuery ? () => setSearchQuery('') : () => setCreateModalOpen(true)}
            />

            {/* If no notebooks, show templates directly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {starterTemplates.map((tpl, i) => {
                const TplIcon = tpl.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleCreateFromTemplate(tpl)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {tpl.category}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TplIcon className="w-4 h-4" />
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs font-semibold text-emerald-700">
                      <span>+ Initialize Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      <CreateNotebookModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateNotebook}
        isCreating={isCreating}
      />

      <EditNotebookModal
        isOpen={Boolean(editingNotebook)}
        onClose={() => setEditingNotebook(null)}
        onUpdate={handleUpdateNotebook}
        notebook={editingNotebook}
        isUpdating={isUpdating}
      />

      <DeleteNotebookModal
        isOpen={Boolean(deletingNotebook)}
        onClose={() => setDeletingNotebook(null)}
        onConfirm={handleDeleteNotebook}
        notebookTitle={deletingNotebook?.title || ''}
        isDeleting={isDeleting}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={() => setOnboardingOpen(false)}
      />
    </div>
  );
};
