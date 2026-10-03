import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle2, Link2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ClaimEvidenceMatrix = ({ claims = [], onSelectCitation }) => {
  if (!claims || claims.length === 0) return null;

  const getSupportBadge = (type) => {
    switch (type) {
      case 'direct':
        return (
          <Badge variant="success" size="sm" dot>
            Direct Evidence
          </Badge>
        );
      case 'indirect':
        return (
          <Badge variant="blue" size="sm" dot>
            Contextual Support
          </Badge>
        );
      case 'conflicting':
        return (
          <Badge variant="amber" size="sm" dot>
            Conflicting Evidence
          </Badge>
        );
      case 'insufficient':
      default:
        return (
          <Badge variant="red" size="sm" dot>
            Insufficient Evidence
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#EDF1EE]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#17211D]">Claim-Evidence Verification Matrix</h4>
            <p className="text-[10px] text-[#6B756F]">Factual statement validation against source excerpts</p>
          </div>
        </div>
        <Badge variant="forest" size="sm">
          {claims.length} Verified Claims
        </Badge>
      </div>

      <div className="space-y-2.5">
        {claims.map((claimItem, idx) => (
          <div
            key={claimItem.id || idx}
            className="p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF1EE] space-y-2 hover:border-[#D8E9E2] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-[#17211D] leading-snug">
                "{claimItem.claim}"
              </p>
              <div className="shrink-0">{getSupportBadge(claimItem.supportType)}</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#EDF1EE] text-[10px] text-[#6B756F]">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#17211D]">Evidence Links:</span>
                {claimItem.evidenceReferences && claimItem.evidenceReferences.length > 0 ? (
                  claimItem.evidenceReferences.map((ref, rIdx) => (
                    <span
                      key={rIdx}
                      onClick={() => onSelectCitation && onSelectCitation({ chunkId: ref, snippet: claimItem.claim })}
                      className="px-2 py-0.5 rounded bg-white border border-[#E2E7E3] text-[#1F5E4B] font-semibold cursor-pointer hover:bg-[#E8F2EE] transition-colors inline-flex items-center gap-0.5"
                    >
                      <Link2 className="w-2.5 h-2.5" /> Ref {rIdx + 1}
                    </span>
                  ))
                ) : (
                  <span className="text-rose-600 font-medium">None cited in source base</span>
                )}
              </div>

              <div className="flex items-center gap-1 font-semibold text-[#8E9993]">
                <span>Confidence:</span>
                <span className="text-[#1F5E4B]">{(claimItem.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {claimItem.counterEvidence && claimItem.counterEvidence.length > 0 && (
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Counter-Evidence / Divergent Note:
                </div>
                <p>{claimItem.counterEvidence.join(', ')}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
