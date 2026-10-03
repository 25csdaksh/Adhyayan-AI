import React, { useState, useEffect } from 'react';
import { GitCompare, RefreshCw, Layers, FileText, Globe, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { overviewService } from '../../api/overviewService';
import { useToast } from '../../context/ToastContext';

export const SourceRelationshipsPanel = ({ notebookId, onSelectSource }) => {
  const toast = useToast();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const fetchRelationships = async () => {
    if (!notebookId) return;
    setLoading(true);
    try {
      const res = await overviewService.getRelationships(notebookId);
      if (res?.data?.relationships) {
        setRelationships(res.data.relationships);
      }
    } catch (err) {
      toast.error('Failed to load source relationships', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, [notebookId]);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const res = await overviewService.detectRelationships(notebookId);
      if (res?.data?.relationships) {
        setRelationships(res.data.relationships);
        toast.success(`Detected ${res.data.relationships.length} source relationships`, 'Analysis Complete');
      }
    } catch (err) {
      toast.error('Failed to analyze relationships', 'Error');
    } finally {
      setDetecting(false);
    }
  };

  const getRelBadgeColor = (type) => {
    switch (type) {
      case 'overlapping':
        return 'emerald';
      case 'supporting':
        return 'forest';
      case 'contrasting':
        return 'accent';
      case 'dependent':
        return 'amber';
      default:
        return 'gray';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F8F6] p-4 sm:p-6 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#17211D] flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#1F5E4B]" />
            Source Relationship Graph ({relationships.length})
          </h2>
          <p className="text-xs text-[#6B756F]">
            Topical links, overlaps, and concept dependencies detected across notebook materials
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={RefreshCw}
          isLoading={detecting}
          onClick={handleDetect}
        >
          Re-Analyze Relationships
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse" />
          <div className="h-28 rounded-2xl bg-white border border-[#E2E7E3] animate-pulse" />
        </div>
      ) : relationships.length > 0 ? (
        <div className="space-y-3">
          {relationships.map((rel) => (
            <div
              key={rel._id}
              className="p-5 rounded-2xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B]/60 transition-all shadow-2xs space-y-3"
            >
              {/* Relationship Header Bridge */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Source A */}
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#F7F8F6] border border-[#E2E7E3] min-w-0 max-w-[200px] truncate">
                    {rel.sourceA.sourceType === 'web' ? (
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-[#1F5E4B] shrink-0" />
                    )}
                    <span className="text-xs font-bold text-[#17211D] truncate">{rel.sourceA.title}</span>
                  </div>

                  <ArrowRightLeft className="w-4 h-4 text-[#8E9993] shrink-0 mx-1" />

                  {/* Source B */}
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#F7F8F6] border border-[#E2E7E3] min-w-0 max-w-[200px] truncate">
                    {rel.sourceB.sourceType === 'web' ? (
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-[#1F5E4B] shrink-0" />
                    )}
                    <span className="text-xs font-bold text-[#17211D] truncate">{rel.sourceB.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getRelBadgeColor(rel.relationshipType)} size="sm">
                    {rel.relationshipType.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] font-bold text-[#8E9993]">
                    {Math.round(rel.confidence * 100)}% Confidence
                  </span>
                </div>
              </div>

              {/* Explanation text */}
              <p className="text-xs text-[#4A5550] leading-relaxed font-serif">
                {rel.explanation}
              </p>

              {/* Shared Topics Pills */}
              {rel.sharedTopics?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#EDF1EE]">
                  <span className="text-[10px] font-bold text-[#8E9993] uppercase tracking-wider mr-1">
                    Shared Concepts:
                  </span>
                  {rel.sharedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-md bg-[#E8F2EE] text-[#1F5E4B] text-[10px] font-bold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E2E7E3] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center mx-auto">
            <GitCompare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#17211D]">No relationships detected yet</h3>
          <p className="text-xs text-[#6B756F] max-w-sm mx-auto">
            Add at least two related documents or web sources to detect semantic overlaps and concept bridges.
          </p>
          <Button variant="primary" size="sm" leftIcon={RefreshCw} onClick={handleDetect} isLoading={detecting}>
            Run Relationship Analysis
          </Button>
        </div>
      )}
    </div>
  );
};
