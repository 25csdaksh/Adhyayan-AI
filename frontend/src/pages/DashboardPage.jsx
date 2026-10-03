import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Clock,
  FolderPlus,
  AlertCircle,
  RefreshCw,
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

  // Onboarding Modal state
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    // If user is loaded and hasn't completed onboarding, prompt tour
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
      toast.success(`Notebook "${newNb.title}" created successfully!`, 'Notebook Created');
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create notebook.');
    } finally {
      setIsCreating(false);
    }
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

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E7E3]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F5E4B] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Research Studio Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
            Good morning, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B756F] mt-1">
            Continue your research and learning across your grounded study sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            leftIcon={Sparkles}
            onClick={() => setOnboardingOpen(true)}
          >
            Product Tour
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={Plus}
            onClick={() => setCreateModalOpen(true)}
            className="shadow-sm"
          >
            New Notebook
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">Active Notebooks</span>
          <p className="text-xl sm:text-2xl font-bold text-[#17211D]">
            {isLoading ? '...' : pagination.total}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">Plan Tier</span>
          <p className="text-xl sm:text-2xl font-bold text-[#1F5E4B]">
            {(user?.plan || 'Free').toUpperCase()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">Grounding Status</span>
          <p className="text-xl sm:text-2xl font-bold text-[#1F5E4B]">Zero Hallucination</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">Security Status</span>
          <p className="text-xl sm:text-2xl font-bold text-[#17211D]">SSRF Guarded</p>
        </div>
      </div>

      {/* Main Section: Search and Notebooks */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1F5E4B]" />
            My Notebooks ({pagination.total})
          </h2>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search notebooks..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2"
            />
          </div>
        </div>

        {/* Content Display: Loading, Error, or Notebook Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3 max-w-lg mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="font-semibold text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => fetchNotebooks(searchQuery, 1)}
            >
              Retry
            </Button>
          </div>
        ) : notebooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {notebooks.map((nb) => (
              <NotebookCard
                key={nb._id || nb.id}
                notebook={nb}
                onEdit={(target) => setEditingNotebook(target)}
                onDelete={(target) => setDeletingNotebook(target)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderPlus}
            title={searchQuery ? 'No matching notebooks found' : 'No notebooks yet'}
            description={
              searchQuery
                ? `No notebooks match "${searchQuery}". Try a different search term or clear the filter.`
                : 'Create your first notebook to organize your study materials, research papers, and AI-powered learning workspace.'
            }
            actionLabel={searchQuery ? 'Clear Search' : '+ Create Notebook'}
            onAction={searchQuery ? () => setSearchQuery('') : () => setCreateModalOpen(true)}
          />
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
