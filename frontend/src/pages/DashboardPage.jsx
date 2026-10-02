import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Clock,
  Star,
  Layers,
  FolderPlus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { NotebookCard } from '../components/notebooks/NotebookCard';
import { MOCK_NOTEBOOKS } from '../mock/mockData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { openCreateNotebook } = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const { user } = useAuth();

  const [notebooks, setNotebooks] = useState(MOCK_NOTEBOOKS);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const toast = useToast();

  const displayName = user?.name ? user.name.split(' ')[0] : 'Researcher';

  const handleToggleFavorite = (id) => {
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === id ? { ...nb, isFavorite: !nb.isFavorite } : nb
      )
    );
    const target = notebooks.find((n) => n.id === id);
    if (target) {
      toast.info(
        target.isFavorite ? `Removed "${target.title}" from favorites` : `Starred "${target.title}"`,
        'Favorites'
      );
    }
  };

  const handleDeleteNotebook = (id) => {
    const target = notebooks.find((n) => n.id === id);
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    toast.success(`Deleted notebook "${target?.title || ''}"`, 'Deleted');
  };

  const categories = [
    { id: 'all', label: 'All Notebooks', badge: notebooks.length },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: notebooks.filter((n) => n.isFavorite).length },
    { id: 'Core CS', label: 'Core CS' },
    { id: 'Systems', label: 'Systems' },
    { id: 'Algorithms', label: 'Algorithms' },
    { id: 'AI / ML', label: 'AI / ML' },
  ];

  const filteredNotebooks = useMemo(() => {
    return notebooks.filter((nb) => {
      const matchesSearch =
        nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nb.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeCategory === 'favorites') {
        return matchesSearch && nb.isFavorite;
      }
      if (activeCategory !== 'all') {
        return matchesSearch && nb.category === activeCategory;
      }
      return matchesSearch;
    });
  }, [notebooks, searchQuery, activeCategory]);

  const recentNotebooks = useMemo(() => {
    return notebooks.slice(0, 3);
  }, [notebooks]);

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

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={Plus}
            onClick={openCreateNotebook}
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
          <p className="text-xl sm:text-2xl font-bold text-[#17211D]">{notebooks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">Indexed Sources</span>
          <p className="text-xl sm:text-2xl font-bold text-[#17211D]">28 documents</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">AI Q&amp;A Inquiries</span>
          <p className="text-xl sm:text-2xl font-bold text-[#17211D]">142 queries</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E7E3] space-y-1">
          <span className="text-xs font-medium text-[#6B756F]">Storage Quota</span>
          <p className="text-xl sm:text-2xl font-bold text-[#1F5E4B]">84 MB <span className="text-xs font-normal text-[#8E9993]">/ 500 MB</span></p>
        </div>
      </div>

      {/* Section 1: Recent Notebooks (if no search query) */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1F5E4B]" />
              Recently Opened
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {recentNotebooks.map((nb) => (
              <NotebookCard
                key={nb.id}
                notebook={nb}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteNotebook}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: All Notebooks with Search & Filters */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1F5E4B]" />
            All Notebooks
          </h2>

          <div className="w-full md:w-72">
            <Input
              placeholder="Filter notebooks..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <Tabs
          tabs={categories}
          activeTab={activeCategory}
          onChange={setActiveCategory}
          variant="underline"
        />

        {/* Notebooks Grid */}
        {filteredNotebooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredNotebooks.map((nb) => (
              <NotebookCard
                key={nb.id}
                notebook={nb}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteNotebook}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderPlus}
            title={searchQuery ? 'No matching notebooks found' : 'No notebooks in this category'}
            description={
              searchQuery
                ? `No notebooks match "${searchQuery}". Try a different keyword or clear your filter.`
                : 'Create a new study notebook to organize your research sources and start asking questions.'
            }
            actionLabel={searchQuery ? 'Clear Search' : '+ New Notebook'}
            onAction={searchQuery ? () => setSearchQuery('') : openCreateNotebook}
          />
        )}
      </section>
    </div>
  );
};
