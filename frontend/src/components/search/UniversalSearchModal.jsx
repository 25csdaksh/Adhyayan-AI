import React, { useState, useEffect } from 'react';
import { Search, FileText, MessageSquare, Bookmark, Sparkles, X, ArrowRight, Globe } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { overviewService } from '../../api/overviewService';

export const UniversalSearchModal = ({ isOpen, onClose, notebookId, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ sources: [], chats: [], insights: [], studyTools: [] });
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ sources: [], chats: [], insights: [], studyTools: [] });
      setTotalCount(0);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || !notebookId) {
      setResults({ sources: [], chats: [], insights: [], studyTools: [] });
      setTotalCount(0);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await overviewService.universalSearch(notebookId, {
          q: query.trim(),
          category,
        });
        if (res?.data?.results) {
          setResults(res.data.results);
          setTotalCount(res.data.totalCount || 0);
        }
      } catch {
        // Silently catch search errors
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, category, notebookId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Universal Notebook Search"
      size="lg"
    >
      <div className="space-y-4 max-h-[75vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#8E9993] absolute left-3.5 top-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search across sources, chat history, insights, and study tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E2E7E3] bg-white text-sm text-[#17211D] focus:outline-none focus:border-[#1F5E4B] shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#F2F5F3] rounded-xl text-xs font-semibold text-[#6B756F]">
          {['all', 'sources', 'chats', 'insights', 'study_tools'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-all capitalize ${
                category === cat
                  ? 'bg-white text-[#1F5E4B] shadow-2xs font-bold'
                  : 'hover:text-[#17211D]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[#1F5E4B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6B756F]">Searching notebook knowledge...</p>
            </div>
          ) : query.trim() && totalCount === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B756F]">
              No matching records found for "{query}". Try a different keyword or category.
            </div>
          ) : (
            <>
              {/* Sources Section */}
              {results.sources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#8E9993] uppercase tracking-wider block">
                    Sources ({results.sources.length})
                  </span>
                  {results.sources.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onSelectResult && onSelectResult('sources', s);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B] transition-all cursor-pointer shadow-2xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {s.sourceType === 'web' ? <Globe className="w-3.5 h-3.5 text-blue-600" /> : <FileText className="w-3.5 h-3.5 text-[#1F5E4B]" />}
                        <span className="text-xs font-bold text-[#17211D]">{s.title}</span>
                      </div>
                      {s.snippet && (
                        <p className="text-[11px] text-[#6B756F] line-clamp-2 font-serif">{s.snippet}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Section */}
              {results.insights.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#8E9993] uppercase tracking-wider block">
                    Saved Insights ({results.insights.length})
                  </span>
                  {results.insights.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => {
                        onSelectResult && onSelectResult('insights', i);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B] transition-all cursor-pointer shadow-2xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-[#17211D]">{i.title}</span>
                      </div>
                      <p className="text-[11px] text-[#6B756F] line-clamp-2 font-serif">{i.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Messages Section */}
              {results.chats.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#8E9993] uppercase tracking-wider block">
                    Chat History ({results.chats.length})
                  </span>
                  {results.chats.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectResult && onSelectResult('chat', c);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B] transition-all cursor-pointer shadow-2xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-[#17211D]">
                          {c.role === 'user' ? 'User Question' : 'Adhyayan-AI Response'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B756F] line-clamp-2 font-serif">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Study Tools Section */}
              {results.studyTools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#8E9993] uppercase tracking-wider block">
                    Study Tools ({results.studyTools.length})
                  </span>
                  {results.studyTools.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSelectResult && onSelectResult('study', t);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B] transition-all cursor-pointer shadow-2xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-[#17211D]">{t.title}</span>
                        <Badge variant="gray" size="sm">{t.toolType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
