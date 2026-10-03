import React, { useState, useEffect } from 'react';
import { Clock, Search, Trash2, ArrowRight, Compass, Sparkles, Layers, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { researchSessionService } from '../../api/researchSessionService';
import { useToast } from '../../context/ToastContext';
import { formatRelativeDate } from '../../utils/formatters';

export const ResearchHistoryPanel = ({ notebookId, onSelectSession }) => {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchHistory = async () => {
    if (!notebookId) return;
    setLoading(true);
    try {
      const res = await researchSessionService.getResearchSessions(notebookId, {
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res?.data?.sessions) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      toast.error('Failed to load research history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [notebookId, search, statusFilter]);

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    if (!sessionId) return;
    try {
      await researchSessionService.deleteResearchSession(notebookId, sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success('Research session deleted');
    } catch (err) {
      toast.error('Failed to delete research session');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9993]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past research sessions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E7E3] rounded-xl focus:outline-none focus:border-[#1F5E4B] transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-[#E2E7E3] rounded-xl focus:outline-none focus:border-[#1F5E4B] text-[#17211D] cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed / Sparse</option>
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : sessions.length > 0 ? (
          sessions.map((s) => (
            <div
              key={s._id}
              onClick={() => onSelectSession(s)}
              className="p-3.5 bg-white rounded-2xl border border-[#E2E7E3] hover:border-[#1F5E4B] hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#17211D] truncate group-hover:text-[#1F5E4B]">
                    {s.title}
                  </h4>
                  <Badge variant={s.status === 'completed' ? 'forest' : 'gray'} size="sm">
                    {s.researchIntent?.category?.toUpperCase() || 'RESEARCH'}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#6B756F] truncate">
                  "{s.originalQuestion}"
                </p>
                <div className="text-[10px] text-[#8E9993] flex items-center gap-2 pt-0.5">
                  <span>{formatRelativeDate(s.createdAt)}</span>
                  <span>•</span>
                  <span>{s.evidenceCount || 0} evidence excerpts</span>
                  <span>•</span>
                  <span>{s.citationCount || 0} citations</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDelete(s._id, e)}
                  className="p-1.5 text-[#8E9993] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ArrowRight className="w-4 h-4 text-[#8E9993] group-hover:text-[#1F5E4B] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-[#E2E7E3] text-xs text-[#6B756F] space-y-2">
            <Compass className="w-8 h-8 text-[#8E9993] mx-auto opacity-50" />
            <p className="font-semibold text-[#17211D]">No research sessions found</p>
            <p className="text-[11px]">Run a research inquiry to build your synthesis history.</p>
          </div>
        )}
      </div>
    </div>
  );
};
