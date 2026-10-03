import React from 'react';
import { ListOrdered, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ResearchPlanViewer = ({ plan = [] }) => {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#EDF1EE]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center">
            <ListOrdered className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#17211D]">Deterministic Research Plan</span>
        </div>
        <Badge variant="forest" size="sm">
          {plan.length} Sub-inquiries
        </Badge>
      </div>

      <div className="space-y-2.5">
        {plan.map((step, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF1EE] space-y-1 hover:border-[#D8E9E2] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-[#1F5E4B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber || idx + 1}
                </span>
                <p className="text-xs font-semibold text-[#17211D] leading-snug">
                  {step.subQuestion}
                </p>
              </div>

              <Badge
                variant={step.status === 'completed' ? 'success' : step.status === 'failed' ? 'red' : 'gray'}
                size="sm"
              >
                {step.status === 'completed' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {step.evidenceCount || 0} Ev
                  </span>
                ) : (
                  step.status
                )}
              </Badge>
            </div>

            {step.purpose && (
              <p className="text-[11px] text-[#6B756F] pl-7 italic">
                Objective: {step.purpose}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
