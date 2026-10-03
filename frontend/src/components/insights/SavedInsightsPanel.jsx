import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Tag, Trash2, Edit3, Pin, Search, Sparkles, Quote, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { insightService } from '../../api/insightService';
import { useToast } from '../../context/ToastContext';

export const SavedInsightsPanel = ({ notebookId, onCitationClick }) => {
  const toast = useToast();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editInsight, setEditInsight] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formPinned, setFormPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchInsights = async () => {
    if (!notebookId) return;
    setLoading(true);
    try {
      const res = await insightService.getSavedInsights(notebookId, {
        search: search || undefined,
        tag: selectedTag || undefined,
      });
      if (res?.data?.insights) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      toast.error('Failed to load saved insights', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [notebookId, search, selectedTag]);

  const handleSaveInsight = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    setSubmitting(true);
    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      if (editInsight) {
        const res = await insightService.updateSavedInsight(notebookId, editInsight._id, {
          title: formTitle.trim(),
          content: formContent.trim(),
          tags: tagsArray,
          pinned: formPinned,
        });
        if (res?.data?.insight) {
          setInsights((prev) =>
            prev.map((i) => (i._id === editInsight._id ? res.data.insight : i))
          );
          toast.success('Insight updated successfully', 'Saved');
        }
      } else {
        const res = await insightService.createSavedInsight(notebookId, {
          title: formTitle.trim(),
          content: formContent.trim(),
          tags: tagsArray,
          pinned: formPinned,
        });
        if (res?.data?.insight) {
          setInsights((prev) => [res.data.insight, ...prev]);
          toast.success('New research insight saved', 'Saved');
        }
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save insight', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await insightService.deleteSavedInsight(notebookId, id);
      setInsights((prev) => prev.filter((i) => i._id !== id));
      toast.info('Insight removed', 'Deleted');
    } catch (err) {
      toast.error('Failed to delete insight', 'Error');
    }
  };

  const handleOpenCreate = () => {
    setEditInsight(null);
    setFormTitle('');
    setFormContent('');
    setFormTags('');
    setFormPinned(false);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (insight) => {
    setEditInsight(insight);
    setFormTitle(insight.title);
    setFormContent(insight.content);
    setFormTags(insight.tags?.join(', ') || '');
    setFormPinned(insight.pinned || false);
    setCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditInsight(null);
  };

  const allTags = Array.from(new Set(insights.flatMap((i) => i.tags || [])));

  return (
    <div className="flex flex-col h-full bg-[#F7F8F6] p-4 sm:p-6 space-y-4 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#17211D] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#1F5E4B]" />
            Saved Research Insights ({insights.length})
          </h2>
          <p className="text-xs text-[#6B756F]">
            Key facts, synthesized findings, and curated study takeaways
          </p>
        </div>

        <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenCreate}>
          New Insight
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8E9993] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search insights by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E2E7E3] bg-white text-xs text-[#17211D] focus:outline-none focus:border-[#1F5E4B]"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                !selectedTag ? 'bg-[#1F5E4B] text-white' : 'bg-white text-[#6B756F] border border-[#E2E7E3]'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  selectedTag === tag
                    ? 'bg-[#1F5E4B] text-white'
                    : 'bg-white text-[#6B756F] border border-[#E2E7E3] hover:border-[#1F5E4B]'
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Insights Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse h-40" />
          <div className="p-6 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse h-40" />
        </div>
      ) : insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div
              key={insight._id}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-2xs space-y-3 flex flex-col justify-between ${
                insight.pinned ? 'border-[#1F5E4B] ring-1 ring-[#1F5E4B]/20' : 'border-[#E2E7E3] hover:border-[#1F5E4B]/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-1.5 leading-snug">
                    {insight.pinned && <Pin className="w-3.5 h-3.5 text-[#1F5E4B] fill-[#1F5E4B] shrink-0" />}
                    {insight.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(insight)}
                      className="p-1 text-[#8E9993] hover:text-[#17211D] rounded transition-colors"
                      title="Edit insight"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(insight._id)}
                      className="p-1 text-[#8E9993] hover:text-red-600 rounded transition-colors"
                      title="Delete insight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#4A5550] leading-relaxed whitespace-pre-line font-serif">
                  {insight.content}
                </p>

                {/* Citation references if available */}
                {insight.sourceReferences?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {insight.sourceReferences.map((ref, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onCitationClick && onCitationClick(ref)}
                        className="px-2 py-0.5 rounded-md bg-[#E8F2EE] hover:bg-[#D8E9E2] text-[#1F5E4B] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Quote className="w-2.5 h-2.5" />
                        <span>[{ref.citationNumber || idx + 1}] {ref.documentTitle || 'Source'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags & Timestamp Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EDF1EE] text-[10px] text-[#8E9993]">
                <div className="flex flex-wrap gap-1">
                  {insight.tags?.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-[#F2F5F3] text-[#6B756F]">
                      #{t}
                    </span>
                  ))}
                </div>
                <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E2E7E3] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#17211D]">No saved insights yet</h3>
          <p className="text-xs text-[#6B756F] max-w-sm mx-auto">
            Save important answers from AI chat or add custom study notes to build your research library.
          </p>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenCreate}>
            Create First Insight
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseModal}
        title={editInsight ? 'Edit Saved Insight' : 'Save New Research Insight'}
        size="md"
      >
        <form onSubmit={handleSaveInsight} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211D] mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Principle of Deadlock Prevention"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] text-xs focus:outline-none focus:border-[#1F5E4B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211D] mb-1">Insight Content / Findings</label>
            <textarea
              required
              rows={5}
              placeholder="Key takeaway, definition, or synthesized conclusion..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] text-xs focus:outline-none focus:border-[#1F5E4B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211D] mb-1">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. deadlock, operating-systems, exam-prep"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] text-xs focus:outline-none focus:border-[#1F5E4B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={formPinned}
              onChange={(e) => setFormPinned(e.target.checked)}
              className="rounded border-[#E2E7E3] text-[#1F5E4B] focus:ring-[#1F5E4B]"
            />
            <label htmlFor="pinnedCheck" className="text-xs font-semibold text-[#17211D] cursor-pointer">
              Pin to top of insights gallery
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7E3]">
            <Button variant="outline" size="sm" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editInsight ? 'Update Insight' : 'Save Insight'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
