import React from 'react';
import { HelpCircle, Lightbulb, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const KnowledgeGapsPanel = ({ knowledgeGaps = [] }) => {
  if (!knowledgeGaps || knowledgeGaps.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#EDF1EE]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17211D]">Knowledge Gaps & Incomplete Coverage</h4>
            <p className="text-[10px] text-[#6B756F]">Unanswered aspects requiring supplementary sources</p>
          </div>
        </div>
        <Badge variant="indigo" size="sm">
          {knowledgeGaps.length} Gaps Identified
        </Badge>
      </div>

      <div className="space-y-2.5">
        {knowledgeGaps.map((gap, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF1EE] space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#17211D]">{gap.topic}</span>
              <Badge variant="gray" size="sm">
                Unanswered
              </Badge>
            </div>

            <p className="text-[11px] text-[#6B756F] leading-relaxed">
              {gap.reason}
            </p>

            {gap.recommendation && (
              <div className="p-2 bg-indigo-50/50 rounded-lg text-[11px] text-indigo-900 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>{gap.recommendation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
