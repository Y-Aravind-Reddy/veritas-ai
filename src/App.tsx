/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { InvestigationInput } from './components/InvestigationInput.tsx';
import { AgentLoopViewer } from './components/AgentLoopViewer.tsx';
import { ReportView } from './components/ReportView.tsx';
import { HumanReviewModal } from './components/HumanReviewModal.tsx';
import { EvaluationDashboard } from './components/EvaluationDashboard.tsx';
import { ArchiveView } from './components/ArchiveView.tsx';
import { EvidenceExplorer } from './components/EvidenceExplorer.tsx';
import { VerdictCenter } from './components/VerdictCenter.tsx';
import { N8nIntegrationModal } from './components/N8nIntegrationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { 
  InvestigationReport, 
  CognitiveStep, 
  Claim, 
  ClaimVerdict 
} from './types/investigation.ts';
import { 
  subscribeToInvestigationUpdates, 
  isSupabaseConfigured,
  fetchAllSupabaseInvestigations,
  fetchSupabaseInvestigation,
  supabase
} from './lib/supabase.ts';
import { 
  ShieldCheck, 
  AlertCircle, 
  Workflow, 
  Database, 
  Layers,
  Radio,
  Sparkles
} from 'lucide-react';

function VeritasAppContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'workspace' | 'archive' | 'review' | 'evaluation' | 'agent' | 'evidence' | 'verdict'>('workspace');
  const [reports, setReports] = useState<InvestigationReport[]>([]);
  const [currentReport, setCurrentReport] = useState<InvestigationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTrace, setActiveTrace] = useState<CognitiveStep[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    geminiConfigured: true,
    investigationCount: 0,
  });

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaimForReview, setSelectedClaimForReview] = useState<Claim | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [n8nModalOpen, setN8nModalOpen] = useState(false);

  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch reports from Supabase if configured, or fall back to local persistent store
  const refreshReports = async () => {
    try {
      let loadedReports: InvestigationReport[] = [];

      if (isSupabaseConfigured) {
        try {
          const supabaseReports = await fetchAllSupabaseInvestigations();
          if (supabaseReports.length > 0) {
            loadedReports = supabaseReports;
          }
        } catch (sbErr) {
          console.warn('Supabase fetch failed, falling back to server store:', sbErr);
        }
      }

      if (loadedReports.length === 0) {
        const reportsRes = await fetch('/api/reports');
        const reportsData = await reportsRes.json();
        if (reportsData.success && Array.isArray(reportsData.data)) {
          loadedReports = reportsData.data;
        }
      }

      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();

      setReports(loadedReports);
      if (!currentReport && loadedReports.length > 0) {
        setCurrentReport(loadedReports[0]);
        setActiveTrace(loadedReports[0].cognitiveTrace || []);
      }
      setSystemStatus({
        geminiConfigured: healthData.geminiConfigured ?? true,
        investigationCount: loadedReports.length,
      });
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    refreshReports();
  }, []);

  // Supabase Realtime subscription for active investigation
  useEffect(() => {
    if (!currentReport?.id || !isSupabaseConfigured) return;

    const unsubscribe = subscribeToInvestigationUpdates(currentReport.id, {
      onInvestigationChange: (updated) => {
        setCurrentReport((prev) => prev ? { ...prev, ...updated } : prev);
        showNotification(`Investigation ${currentReport.id.slice(0, 8)} updated via Realtime.`);
      },
      onAgentEvent: (newEvent) => {
        setActiveTrace((prev) => [...prev, newEvent]);
        setCurrentReport((prev) => prev ? {
          ...prev,
          cognitiveTrace: [...(prev.cognitiveTrace || []), newEvent]
        } : prev);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentReport?.id]);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Submit a new investigation through Supabase -> n8n.
  // The browser never receives the n8n webhook token or callback secret.
  const handleInvestigateSubmit = async (data: {
    text: string;
    platform: any;
    author?: string;
    handle?: string;
  }) => {
    if (!isSupabaseConfigured) {
      setErrorNotice('Supabase is not configured. Add the public Supabase URL and publishable/anon key before launching an n8n investigation.');
      return;
    }

    const claimText = String(data.text || '').trim();
    if (claimText.length < 20 || claimText.length > 12000) {
      setErrorNotice('Please enter a claim between 20 and 12,000 characters.');
      return;
    }

    setIsLoading(true);
    setErrorNotice(null);

    const startedAt = new Date().toISOString();
    const initialSteps: CognitiveStep[] = [{
      id: `local-init-${Date.now()}`,
      phase: 'PLAN',
      title: 'Investigation submitted to VERITAS',
      detail: 'Creating the investigation record in Supabase and dispatching the claim to the configured n8n workflow.',
      timestamp: startedAt,
      status: 'in_progress',
    }];
    setActiveTrace(initialSteps);

    try {
      const { data: result, error } = await supabase.functions.invoke('start-investigation', {
        body: {
          post_text: claimText,
          source_platform: data.platform || 'Direct Input',
          language: 'en',
          author: data.author || null,
          handle: data.handle || null,
        },
      });

      if (error) {
        throw new Error(error.message || 'Could not invoke the start-investigation function.');
      }
      if (!result?.success || !result?.investigation_id) {
        throw new Error(result?.error || 'The investigation could not be queued.');
      }

      const investigationId = result.investigation_id as string;
      let newReport = await fetchSupabaseInvestigation(investigationId);

      // A newly-created record may not be immediately visible through the
      // browser's RLS policy. Keep a truthful queued view until Realtime/polling
      // can load the persisted result; do not fabricate claims or verdicts.
      if (!newReport) {
        newReport = {
          id: investigationId,
          createdAt: startedAt,
          updatedAt: startedAt,
          sourceText: claimText,
          sourceMetadata: {
            platform: data.platform || 'Direct Input',
            author: data.author,
            handle: data.handle,
          },
          overallVerdict: 'INCONCLUSIVE',
          credibilityScore: 0,
          misinformationRisk: 'MODERATE',
          executiveSummary: result.n8n_triggered
            ? 'Investigation accepted by the n8n dispatch function. Waiting for agent results to be saved in Supabase.'
            : 'Investigation record created, but n8n dispatch is not yet confirmed. Check the Edge Function logs and n8n execution.',
          claims: [],
          cognitiveTrace: initialSteps,
          allCitations: [],
          status: 'ANALYZING',
          metrics: {
            durationMs: 0,
            searchesExecuted: 0,
            sourcesConsulted: 0,
            claimsCount: 0,
            loopCycles: 0,
          },
        };
      }

      setCurrentReport(newReport);
      setActiveTrace(newReport.cognitiveTrace || initialSteps);
      setReports((prev) => [newReport!, ...prev.filter((r) => r.id !== newReport!.id)]);
      setSystemStatus((prev) => ({
        ...prev,
        investigationCount: Math.max(prev.investigationCount + 1, reports.length + 1),
      }));

      if (result.n8n_triggered) {
        showNotification('Investigation queued and dispatched to the n8n agent.');
      } else {
        setErrorNotice(
          result.n8n_error
            ? `Investigation record was created, but n8n dispatch was not confirmed: ${result.n8n_error}`
            : 'Investigation record was created, but N8N_WEBHOOK_URL is not configured.'
        );
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to submit the investigation to Supabase/n8n.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit editorial review
  const handleSubmitReview = async (reviewData: {
    reviewer: string;
    decision: 'APPROVED' | 'REJECTED' | 'MODIFIED';
    decisionNotes: string;
    claimReviews: Array<{
      claimId: string;
      overrideVerdict?: ClaimVerdict;
      notes: string;
    }>;
  }) => {
    if (!currentReport) return;
    try {
      const res = await fetch(`/api/reports/${currentReport.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewData,
          reviewer: reviewData.reviewer || profile?.full_name || 'Senior Editor',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentReport(data.data);
        setReports((prev) =>
          prev.map((r) => (r.id === data.data.id ? data.data : r))
        );
        showNotification('Editorial sign-off recorded and certified in Supabase audit table.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  // Delete report
  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        if (currentReport?.id === id) {
          const remaining = reports.filter((r) => r.id !== id);
          setCurrentReport(remaining.length > 0 ? remaining[0] : null);
        }
        setSystemStatus((prev) => ({
          ...prev,
          investigationCount: Math.max(0, prev.investigationCount - 1),
        }));
        showNotification('Report removed from records.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Reset archive
  const handleResetArchive = async () => {
    try {
      const res = await fetch('/api/reports/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
        if (data.data.length > 0) {
          setCurrentReport(data.data[0]);
          setActiveTrace(data.data[0].cognitiveTrace);
        }
        setSystemStatus((prev) => ({
          ...prev,
          investigationCount: data.data.length,
        }));
        showNotification('Records restored to initial verification baseline.');
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Quick sample select
  const handleQuickSampleSelect = (sampleKey: string) => {
    setActiveTab('workspace');
    if (sampleKey === 'rate_cut') {
      const match = reports.find((r) => r.id.includes('8912'));
      if (match) {
        setCurrentReport(match);
        setActiveTrace(match.cognitiveTrace);
      }
    } else if (sampleKey === 'microplastics') {
      const match = reports.find((r) => r.id.includes('7731'));
      if (match) {
        setCurrentReport(match);
        setActiveTrace(match.cognitiveTrace);
      }
    }
  };

  // Simulate an n8n event for live testing
  const handleSimulateN8nEvent = (phase: 'PLAN' | 'ACT' | 'OBSERVE' | 'REPLAN' | 'SYNTHESIZE') => {
    if (!currentReport) return;
    const descriptions: Record<string, { title: string; detail: string; queries?: string[] }> = {
      PLAN: {
        title: "n8n Agent: Sub-Claim Extraction Plan",
        detail: "Decomposed submission into distinct verifiable assertions and mapped priority verification targets.",
        queries: ["n8n: verify statement syntax and historical precedents"],
      },
      ACT: {
        title: "n8n Webhook: Live Source Grounding Call",
        detail: "Executed Google Search grounding via n8n HTTP Request node and extracted live citations.",
        queries: ["n8n: check reuters, sec, and bloomberg archives"],
      },
      OBSERVE: {
        title: "n8n Agent: Source Authenticity Evaluation",
        detail: "Classified publisher credibility tiers and checked for document doctoring or cherry-picking.",
      },
      REPLAN: {
        title: "n8n Agent: Adversarial Counter-Hypothesis Re-Plan",
        detail: "Refining queries against recurring misinformation patterns and known viral templates.",
      },
      SYNTHESIZE: {
        title: "n8n Agent: Final Consensus Calibration",
        detail: "Calibrated overall confidence score and assigned definitive claim verdicts.",
      },
    };

    const info = descriptions[phase] || descriptions.PLAN;
    const newStep: CognitiveStep = {
      id: `cog-sim-${Date.now()}`,
      phase,
      title: info.title,
      detail: info.detail,
      searchQueries: info.queries || [],
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    setActiveTrace((prev) => [...prev, newStep]);
    setCurrentReport((prev) => prev ? {
      ...prev,
      cognitiveTrace: [...(prev.cognitiveTrace || []), newStep]
    } : prev);

    // Also inform server
    fetch('/api/n8n/agent-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investigation_id: currentReport.id,
        phase,
        title: info.title,
        detail: info.detail,
        search_queries: info.queries,
      }),
    }).catch(() => {});

    showNotification(`Simulated ${phase} event dispatched to live trace.`);
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onQuickSampleSelect={handleQuickSampleSelect}
        isInvestigating={isLoading}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenN8nModal={() => setN8nModalOpen(true)}
      />

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950 text-emerald-200 border border-emerald-700 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Error Alert */}
        {errorNotice && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold block text-rose-200">System Notification:</strong>
                <p>{errorNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-rose-400 hover:text-rose-200 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <InvestigationInput
              onSubmit={handleInvestigateSubmit}
              isLoading={isLoading}
            />

            {isLoading && (
              <AgentLoopViewer
                steps={activeTrace}
                isLoading={true}
              />
            )}

            {currentReport && !isLoading && (
              <ReportView
                report={currentReport}
                onOpenReview={() => {
                  setSelectedClaimForReview(null);
                  setReviewModalOpen(true);
                }}
                onOpenClaimReview={(claim) => {
                  setSelectedClaimForReview(claim);
                  setReviewModalOpen(true);
                }}
                onNewInvestigation={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: VERDICT CENTER */}
        {activeTab === 'verdict' && currentReport && (
          <VerdictCenter
            report={currentReport}
            onOpenReview={(claim) => {
              setSelectedClaimForReview(claim || null);
              setReviewModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: EVIDENCE EXPLORER */}
        {activeTab === 'evidence' && currentReport && (
          <EvidenceExplorer
            report={currentReport}
          />
        )}

        {/* TAB 4: AGENT LOOP */}
        {activeTab === 'agent' && (
          <div>
            {currentReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs text-slate-300">
                      Real-Time Cognitive Loop Stream: <strong className="text-cyan-400 font-mono">{currentReport.id}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setN8nModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-mono"
                  >
                    <Workflow className="w-3.5 h-3.5" />
                    <span>n8n Integration Specs →</span>
                  </button>
                </div>
                <AgentLoopViewer
                  steps={currentReport.cognitiveTrace || activeTrace}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
                <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-200">No active cognitive trace loaded</p>
                <p className="text-xs text-slate-500 mt-1">Start an investigation to trace real-time agent execution.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: HITL REVIEW DESK */}
        {activeTab === 'review' && (
          <div>
            {currentReport ? (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Editorial Review Desk & Certification
                    </h2>
                    <p className="text-xs text-slate-400">
                      Signed in as: <strong className="text-violet-300">{profile?.full_name} ({profile?.role})</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    Open Review Certification Modal
                  </button>
                </div>

                <ReportView
                  report={currentReport}
                  onOpenReview={() => {
                    setSelectedClaimForReview(null);
                    setReviewModalOpen(true);
                  }}
                  onOpenClaimReview={(claim) => {
                    setSelectedClaimForReview(claim);
                    setReviewModalOpen(true);
                  }}
                  onNewInvestigation={() => setActiveTab('workspace')}
                />
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-200">No report selected for editorial review</p>
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="mt-3 text-xs px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium"
                >
                  Start Investigation
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ARCHIVE */}
        {activeTab === 'archive' && (
          <ArchiveView
            reports={reports}
            onSelectReport={(report) => {
              setCurrentReport(report);
              setActiveTrace(report.cognitiveTrace || []);
              setActiveTab('workspace');
            }}
            onDeleteReport={handleDeleteReport}
            onResetArchive={handleResetArchive}
          />
        )}

        {/* TAB 7: EVALUATION */}
        {activeTab === 'evaluation' && (
          <EvaluationDashboard />
        )}

      </main>

      {/* Human Review Modal */}
      {reviewModalOpen && currentReport && (
        <HumanReviewModal
          report={currentReport}
          selectedClaim={selectedClaimForReview}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedClaimForReview(null);
          }}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* n8n Integration Modal */}
      {n8nModalOpen && (
        <N8nIntegrationModal
          onClose={() => setN8nModalOpen(false)}
          onSimulateN8nEvent={handleSimulateN8nEvent}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-[#060911] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">VERITAS AI</span>
            <span>— Enterprise Fact-Checking Architecture with Supabase & n8n</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Supabase: {isSupabaseConfigured ? 'Live Database' : 'Local Migration Ready'}</span>
            <span>n8n: Webhook Contracts Prepared</span>
            <span>RLS: Enforced</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VeritasAppContent />
    </AuthProvider>
  );
}
