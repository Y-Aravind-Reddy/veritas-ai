import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  UserCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { InvestigationReport, Claim, ClaimVerdict } from '../types/investigation.ts';

interface HumanReviewModalProps {
  report: InvestigationReport;
  selectedClaim?: Claim | null;
  onClose: () => void;
  onSubmitReview: (reviewData: {
    reviewer: string;
    decision: 'APPROVED' | 'REJECTED' | 'MODIFIED';
    decisionNotes: string;
    claimReviews: Array<{
      claimId: string;
      overrideVerdict?: ClaimVerdict;
      notes: string;
    }>;
  }) => Promise<void>;
}

const VERDICT_OPTIONS: ClaimVerdict[] = [
  'TRUE',
  'MOSTLY_TRUE',
  'MIXED',
  'MISLEADING',
  'FALSE',
  'UNVERIFIABLE'
];

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  report,
  selectedClaim,
  onClose,
  onSubmitReview,
}) => {
  const [reviewer, setReviewer] = useState('Senior Fact-Checker Desk');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'MODIFIED'>('APPROVED');
  const [decisionNotes, setDecisionNotes] = useState(
    'Corroborated against primary sources and verified factual alignment with official registries.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-claim override state
  const [claimOverrides, setClaimOverrides] = useState<Record<string, { overrideVerdict?: ClaimVerdict; notes: string }>>(() => {
    const initial: Record<string, { overrideVerdict?: ClaimVerdict; notes: string }> = {};
    for (const c of report.claims) {
      initial[c.id] = {
        overrideVerdict: c.humanReview?.overrideVerdict || undefined,
        notes: c.humanReview?.notes || '',
      };
    }
    return initial;
  });

  const handleClaimVerdictChange = (claimId: string, val: string) => {
    setClaimOverrides((prev) => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        overrideVerdict: val === 'keep' ? undefined : (val as ClaimVerdict),
      },
    }));
  };

  const handleClaimNotesChange = (claimId: string, notes: string) => {
    setClaimOverrides((prev) => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        notes,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const claimReviews = Object.entries(claimOverrides).map(([claimId, data]) => ({
        claimId,
        overrideVerdict: data.overrideVerdict,
        notes: data.notes,
      }));

      await onSubmitReview({
        reviewer,
        decision,
        decisionNotes,
        claimReviews,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#090d1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-950 border border-violet-700/60 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Human-in-the-Loop Editorial Certification
              </h3>
              <p className="text-xs text-slate-400">
                Audit AI claim verdicts, adjust confidence, and issue official newsroom sign-off.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Reviewer Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reviewer / Fact-Checker Signature
              </label>
              <input
                type="text"
                required
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                placeholder="e.g. Jane Doe (Lead Fact-Checker)"
                className="w-full bg-[#090d1a] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Editorial Sign-Off Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full bg-[#090d1a] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="APPROVED">CERTIFY & APPROVE (Public Record)</option>
                <option value="MODIFIED">APPROVED WITH OVERRIDES (Adjusted)</option>
                <option value="REJECTED">REQUEST REVISION / RE-INVESTIGATION</option>
              </select>
            </div>
          </div>

          {/* Overall Decision Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Editorial Rationale & Governance Notes
            </label>
            <textarea
              rows={2}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Provide context on why this verdict is approved or modified..."
              className="w-full bg-[#090d1a] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Claim-by-Claim Review List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Claim-Level Review & Override Matrix ({report.claims.length}):
            </h4>

            <div className="space-y-3">
              {report.claims.map((claim, idx) => {
                const currentOverride = claimOverrides[claim.id]?.overrideVerdict;
                const isSelected = selectedClaim?.id === claim.id;

                return (
                  <div
                    key={claim.id}
                    className={`bg-[#090d1a] rounded-xl p-3.5 border transition-colors ${
                      isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/30' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-200">
                        Claim #{idx + 1}: "{claim.statement}"
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">AI: <strong>{claim.verdict}</strong></span>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <select
                          value={currentOverride || 'keep'}
                          onChange={(e) => handleClaimVerdictChange(claim.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="keep">Keep AI Verdict ({claim.verdict})</option>
                          {VERDICT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>Override: {opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Add specific reviewer comment for this claim (optional)..."
                      value={claimOverrides[claim.id]?.notes || ''}
                      onChange={(e) => handleClaimNotesChange(claim.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Certifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Official Editorial Certification</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
