import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Globe,
  Bookmark,
  GitCompare,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  Clock,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { overviewService } from '../../api/overviewService';
import { useToast } from '../../context/ToastContext';

export const KnowledgeOverviewPanel = ({ notebookId, onNavigateTab, onTriggerStudyTool }) => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    if (!notebookId) return;
    setLoading(true);
    try {
      const [overviewRes, recRes] = await Promise.all([
        overviewService.getOverview(notebookId),
        overviewService.getRecommendations(notebookId),
      ]);

      if (overviewRes?.data) {
        setData(overviewRes.data);
      }
      if (recRes?.data?.recommendations) {
        setRecommendations(recRes.data.recommendations);
      }
    } catch (err) {
      toast.error('Failed to load knowledge overview', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [notebookId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const topics = data?.topics || [];
  const definitions = data?.definitions || [];

  return (
    <div className="flex flex-col h-full bg-[#F7F8F6] p-4 sm:p-6 space-y-6 overflow-y-auto">
      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E2E7E3] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756F]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sources</span>
            <FileText className="w-4 h-4 text-[#1F5E4B]" />
          </div>
          <p className="text-2xl font-extrabold text-[#17211D]">{stats.totalSources || 0}</p>
          <p className="text-[10px] text-[#8E9993]">{stats.totalChunks || 0} indexed passages</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E7E3] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756F]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Study Tools</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#17211D]">{stats.studyToolsCount || 0}</p>
          <p className="text-[10px] text-[#8E9993]">Generated syntheses</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E7E3] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756F]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Saved Insights</span>
            <Bookmark className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#17211D]">{stats.savedInsightsCount || 0}</p>
          <p className="text-[10px] text-[#8E9993]">Curated findings</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E7E3] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756F]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Relationships</span>
            <GitCompare className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#17211D]">{stats.relationshipsCount || 0}</p>
          <p className="text-[10px] text-[#8E9993]">Cross-source bridges</p>
        </div>
      </div>

      {/* Personalized Study Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#17211D] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1F5E4B]" />
            Grounded Study Recommendations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B]/60 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#17211D] line-clamp-1">{rec.title}</span>
                    <Badge variant={rec.priority === 'high' ? 'forest' : 'gray'} size="sm">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#6B756F] leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    rightIcon={ArrowRight}
                    onClick={() => {
                      if (rec.actionType === 'generate_tool' && onTriggerStudyTool) {
                        onTriggerStudyTool(rec.toolType, rec.topic);
                      } else if (onNavigateTab) {
                        onNavigateTab(rec.actionType === 'add_source' ? 'sources' : 'chat');
                      }
                    }}
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Concepts & Definitions Glossary */}
      {definitions.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E2E7E3] space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-[#17211D] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#1F5E4B]" />
            Core Concepts & Definitions (Extracted from Sources)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {definitions.map((def, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E2E7E3] space-y-1">
                <span className="text-xs font-bold text-[#1F5E4B]">{def.term}</span>
                <p className="text-[11px] text-[#4A5550] leading-relaxed font-serif">{def.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Major Topics List */}
      {topics.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E2E7E3] space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-[#17211D] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#1F5E4B]" />
            Major Notebook Themes
          </h3>

          <div className="flex flex-wrap gap-2">
            {topics.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] text-xs font-bold border border-[#D8E9E2]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
