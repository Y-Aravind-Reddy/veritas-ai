import React, { useState } from 'react';
import { 
  X, 
  Workflow, 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Sparkles, 
  Zap, 
  Code2, 
  Terminal,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase.ts';

interface N8nIntegrationModalProps {
  onClose: () => void;
  onSimulateN8nEvent?: (phase: 'PLAN' | 'ACT' | 'OBSERVE' | 'REPLAN' | 'SYNTHESIZE') => void;
}

export const N8nIntegrationModal: React.FC<N8nIntegrationModalProps> = ({
  onClose,
  onSimulateN8nEvent,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [simulatedPhase, setSimulatedPhase] = useState<'PLAN' | 'ACT' | 'OBSERVE' | 'REPLAN' | 'SYNTHESIZE'>('ACT');

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleOutgoingPayload = JSON.stringify(
    {
      investigation_id: "7f4c9a81-2b0e-4d56-8e12-c4e99f1a0b32",
      post_text: "BREAKING: Internal Federal Reserve memo leaked showing emergency rate cut scheduled for Monday morning.",
      source_platform: "X / Twitter",
      language: "en",
      author: "MarketAlphaLeaks",
      handle: "@market_alpha_wire",
      callback_url: "https://<your-project-id>.supabase.co/functions/v1/n8n-webhook-callback",
      agent_event_url: "https://<your-project-id>.supabase.co/functions/v1/n8n-agent-event",
      callback_token: "veritas-n8n-callback-secret-key",
      timestamp: "2026-10-31T05:00:00Z"
    },
    null,
    2
  );

  const sampleIncomingPayload = JSON.stringify(
    {
      investigation_id: "7f4c9a81-2b0e-4d56-8e12-c4e99f1a0b32",
      status: "completed",
      overall_verdict: "HIGHLY_MISLEADING",
      credibility_score: 18,
      misinformation_risk: "HIGH",
      executive_summary: "Federal Reserve calendar confirms no emergency FOMC meeting is scheduled. Viral document is an obsolete template.",
      claims: [
        {
          statement: "Federal Reserve scheduled an emergency rate cut for Monday morning.",
          quote_snippet: "emergency rate cut scheduled for Monday morning",
          category: "policy",
          verdict: "FALSE",
          confidence: 96,
          explanation: "No emergency FOMC meeting scheduled. Liquidity indicators show normal stability.",
          evidence_summary: "Federal Reserve Board public releases confirm next meeting on regular schedule.",
          counter_evidence: "Circulating memo ID format nonexistent in Federal Reserve records.",
          decontextualization_factor: "Manufactured crisis rumor to induce retail options trading."
        }
      ],
      sources: [
        {
          title: "Federal Reserve Board - FOMC Meeting Calendar",
          url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
          domain: "federalreserve.gov",
          publisher: "Federal Reserve",
          reliability_tier: "OFFICIAL"
        }
      ],
      metrics: {
        durationMs: 3820,
        searchesExecuted: 5,
        sourcesConsulted: 4,
        loopCycles: 2
      }
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#090d1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Workflow className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  n8n AI Agent & Supabase Integration Center
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Ready for Teammate
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Integration contracts, real-time webhook endpoints, and database synchronization for your n8n workflow.
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

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status & Architecture Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#090d1a] border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Supabase PostgreSQL</span>
                <span className="text-[11px] text-slate-400">
                  {isSupabaseConfigured ? 'Connected to Project' : 'Schema & Migration Ready'}
                </span>
              </div>
            </div>

            <div className="bg-[#090d1a] border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-950/60 text-violet-400 border border-violet-900/60">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Supabase Edge Functions</span>
                <span className="text-[11px] text-slate-400">
                  4 Handlers Prepared in /supabase/functions
                </span>
              </div>
            </div>

            <div className="bg-[#090d1a] border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-900/60">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Supabase Realtime</span>
                <span className="text-[11px] text-slate-400">
                  Live streaming for agent events
                </span>
              </div>
            </div>
          </div>

          {/* Integration Contract 1: Outgoing Payload to n8n */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                1. Outgoing Webhook Trigger (Sent to your teammate's n8n workflow):
              </span>
              <button
                onClick={() => copyToClipboard(sampleOutgoingPayload, 'out')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 font-mono"
              >
                {copiedSection === 'out' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'out' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#070b14] border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-cyan-200 overflow-x-auto leading-relaxed">
              {sampleOutgoingPayload}
            </pre>
          </div>

          {/* Integration Contract 2: Incoming Callback from n8n */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                2. Incoming Callback (Returned by n8n to Supabase Edge Function):
              </span>
              <button
                onClick={() => copyToClipboard(sampleIncomingPayload, 'in')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 font-mono"
              >
                {copiedSection === 'in' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'in' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#070b14] border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-emerald-200 overflow-x-auto leading-relaxed">
              {sampleIncomingPayload}
            </pre>
          </div>

          {/* Live Realtime Simulator */}
          {onSimulateN8nEvent && (
            <div className="bg-[#090d1a] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Test Realtime Event Dispatcher
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Simulate how n8n streams events to Supabase Realtime during active investigations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={simulatedPhase}
                    onChange={(e) => setSimulatedPhase(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PLAN">Phase: PLAN</option>
                    <option value="ACT">Phase: ACT (Search)</option>
                    <option value="OBSERVE">Phase: OBSERVE</option>
                    <option value="REPLAN">Phase: RE-PLAN</option>
                    <option value="SYNTHESIZE">Phase: SYNTHESIZE</option>
                  </select>

                  <button
                    onClick={() => onSimulateN8nEvent(simulatedPhase)}
                    className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Dispatch Test Event</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edge Function Deployment Instructions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-slate-200 block">Deploying to your Supabase Project:</span>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <p>1. Apply SQL schema: <code className="text-cyan-300">supabase db push</code> or paste <code className="text-cyan-300">supabase/migrations/20261031000000_veritas_schema.sql</code> into Supabase SQL Editor.</p>
              <p>2. Deploy Edge Functions: <code className="text-cyan-300">supabase functions deploy start-investigation</code>, <code className="text-cyan-300">n8n-webhook-callback</code>, <code className="text-cyan-300">n8n-agent-event</code>, <code className="text-cyan-300">submit-editorial-review</code>.</p>
              <p>3. Set secrets: <code className="text-cyan-300">supabase secrets set N8N_WEBHOOK_URL=... N8N_CALLBACK_SECRET=...</code></p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
