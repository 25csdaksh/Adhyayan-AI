import React from 'react';
import { AlertTriangle, ArrowRightLeft, FileText } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ContradictionPanel = ({ contradictions = [] }) => {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900">Divergent Source Claims</h4>
            <p className="text-[10px] text-amber-700">Sources differ on these documented topics</p>
          </div>
        </div>
        <Badge variant="amber" size="sm">
          {contradictions.length} Discrepancies
        </Badge>
      </div>

      <div className="space-y-3">
        {contradictions.map((c, idx) => (
          <div
            key={idx}
            className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17211D]">{c.topic}</span>
              <Badge variant="amber" size="sm">
                Sources Differ
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#FAFBF9] rounded-lg border border-[#E2E7E3] space-y-1">
                <div className="font-bold text-[#1F5E4B] flex items-center gap-1 text-[11px]">
                  <FileText className="w-3 h-3" /> {c.sourceA.title}
                </div>
                <p className="text-[#4F5B54] text-[11px] italic">"{c.sourceA.claim}"</p>
              </div>

              <div className="p-2.5 bg-[#FAFBF9] rounded-lg border border-[#E2E7E3] space-y-1">
                <div className="font-bold text-blue-700 flex items-center gap-1 text-[11px]">
                  <FileText className="w-3 h-3" /> {c.sourceB.title}
                </div>
                <p className="text-[#4F5B54] text-[11px] italic">"{c.sourceB.claim}"</p>
              </div>
            </div>

            {c.note && (
              <p className="text-[10px] text-[#6B756F] italic pt-1">
                Analysis: {c.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
