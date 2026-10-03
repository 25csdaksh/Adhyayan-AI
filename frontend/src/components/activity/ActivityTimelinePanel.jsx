import React, { useState, useEffect } from 'react';
import { Clock, Plus, FileText, Globe, Sparkles, Bookmark, GitCompare, MessageSquare, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { overviewService } from '../../api/overviewService';
import { useToast } from '../../context/ToastContext';

export const ActivityTimelinePanel = ({ notebookId }) => {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    if (!notebookId) return;
    setLoading(true);
    try {
      const res = await overviewService.getActivity(notebookId, { limit: 30 });
      if (res?.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      toast.error('Failed to load activity timeline', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [notebookId]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'source_added':
        return <FileText className="w-4 h-4 text-[#1F5E4B]" />;
      case 'question_asked':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'insight_saved':
        return <Bookmark className="w-4 h-4 text-emerald-600" />;
      case 'study_tool_generated':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'relationship_detected':
        return <GitCompare className="w-4 h-4 text-purple-600" />;
      case 'source_refreshed':
        return <RefreshCw className="w-4 h-4 text-cyan-600" />;
      default:
        return <Clock className="w-4 h-4 text-[#6B756F]" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F8F6] p-4 sm:p-6 space-y-4 overflow-y-auto">
      <div>
        <h2 className="text-base font-bold text-[#17211D] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1F5E4B]" />
          Research Activity Timeline ({activities.length})
        </h2>
        <p className="text-xs text-[#6B756F]">
          Chronological milestone trail of study, exploration, and generated research assets
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse" />
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E7E3]">
          {activities.map((item) => (
            <div key={item._id} className="relative flex items-start gap-3">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#1F5E4B] flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F5E4B]" />
              </div>

              {/* Activity Card */}
              <div className="flex-1 p-4 rounded-2xl bg-white border border-[#E2E7E3] shadow-2xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getActionIcon(item.action)}
                    <span className="text-xs font-bold text-[#17211D]">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-[#8E9993]">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                {item.details && (
                  <p className="text-xs text-[#4A5550] pl-6 font-serif">
                    {item.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E2E7E3] space-y-2">
          <Clock className="w-8 h-8 text-[#8E9993] mx-auto" />
          <h3 className="text-sm font-bold text-[#17211D]">No activity logged yet</h3>
          <p className="text-xs text-[#6B756F]">
            Activities like adding sources, asking questions, and saving insights will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
