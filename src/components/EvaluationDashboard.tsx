import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  Layers, 
  Globe, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { EvaluationMetrics, ClaimVerdict } from '../types/investigation.ts';

interface EvaluationDashboardProps {
  onSelectInvestigation?: (id: string) => void;
}

const VERDICT_COLOR_MAP: Record<ClaimVerdict, { label: string; color: string; bg: string }> = {
  TRUE: { label: "Verified True", color: "text-emerald-400", bg: "bg-emerald-500" },
  MOSTLY_TRUE: { label: "Substantially True", color: "text-teal-400", bg: "bg-teal-500" },
  MIXED: { label: "Mixed / Nuanced", color: "text-amber-400", bg: "bg-amber-500" },
  MISLEADING: { label: "Misleading", color: "text-orange-400", bg: "bg-orange-500" },
  FALSE: { label: "Confirmed False", color: "text-rose-400", bg: "bg-rose-500" },
  UNVERIFIABLE: { label: "Unverifiable", color: "text-purple-400", bg: "bg-purple-500" },
};

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = () => {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/evaluation');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to load evaluation metrics');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-12 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-mono">Aggregating live verification metrics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-rose-900/50 p-6 text-center text-rose-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
        <p className="text-sm mb-3">{error || 'Could not load metrics'}</p>
        <button
          onClick={fetchMetrics}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalClaims = metrics.totalClaimsChecked || 1;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Model Performance & Verification Intelligence Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics aggregated across all investigations, claim verdicts, grounded sources, and human editorial reviews.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Investigations */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">INVESTIGATIONS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {metrics.totalInvestigations}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Completed full cycles</span>
        </div>

        {/* Claims Checked */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">CLAIMS AUDITED</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {metrics.totalClaimsChecked}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Atomic assertions verified</span>
        </div>

        {/* Average Latency */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">AVG LATENCY</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {(metrics.averageLatencyMs / 1000).toFixed(2)}s
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Multi-cycle search + replan</span>
        </div>

        {/* Human Intervention Rate */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">HITL OVERSIGHT</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics.humanInterventionRate}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Editorial certified reports</span>
        </div>

      </div>

      {/* Main Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verdict Distribution Card */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Claim Verdict Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Classification outcomes across all atomic claims tested.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {metrics.totalClaimsChecked} Claims
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(VERDICT_COLOR_MAP) as ClaimVerdict[]).map((vKey) => {
              const count = metrics.verdictDistribution[vKey] || 0;
              const percent = Math.round((count / totalClaims) * 100);
              const info = VERDICT_COLOR_MAP[vKey];

              return (
                <div key={vKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${info.color}`}>{info.label}</span>
                    <span className="font-mono text-slate-300">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${info.bg} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Misinformation Risk Distribution & Grounding Domains */}
        <div className="space-y-6">
          
          {/* Risk Level Distribution */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Misinformation Risk Tiers
              </h3>
              <p className="text-xs text-slate-400">
                Threat potential to public discourse, health, and markets.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-3">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">Low</span>
                <span className="text-xl font-bold font-mono text-white">
                  {metrics.riskDistribution.LOW || 0}
                </span>
              </div>

              <div className="bg-amber-950/40 border border-amber-900/60 rounded-xl p-3">
                <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">Moderate</span>
                <span className="text-xl font-bold font-mono text-white">
                  {metrics.riskDistribution.MODERATE || 0}
                </span>
              </div>

              <div className="bg-orange-950/40 border border-orange-900/60 rounded-xl p-3">
                <span className="text-[10px] uppercase font-mono text-orange-400 block mb-1">High</span>
                <span className="text-xl font-bold font-mono text-white">
                  {metrics.riskDistribution.HIGH || 0}
                </span>
              </div>

              <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3">
                <span className="text-[10px] uppercase font-mono text-rose-400 block mb-1">Critical</span>
                <span className="text-xl font-bold font-mono text-white">
                  {metrics.riskDistribution.CRITICAL || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Top Consulted Sources */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 space-y-3">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Top Grounded Authority Domains
              </h3>
              <p className="text-xs text-slate-400">
                Frequently referenced primary sources and fact-checking engines.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {metrics.topDomains.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#090d1a] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300 font-mono truncate mr-2">
                    {item.domain}
                  </span>
                  <span className="text-cyan-400 font-mono font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
