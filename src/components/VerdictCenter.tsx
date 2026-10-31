import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  ShieldAlert, 
  FileCheck, 
  Filter, 
  Layers,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { InvestigationReport, Claim, ClaimVerdict } from '../types/investigation.ts';

interface VerdictCenterProps {
  report: InvestigationReport;
  onOpenReview: (claim?: Claim) => void;
}

export const VerdictCenter: React.FC<VerdictCenterProps> = ({ report, onOpenReview }) => {
  const [selectedVerdictFilter, setSelectedVerdictFilter] = useState<string>('ALL');

  const filteredClaims = (report.claims || []).filter((c) => {
    return selectedVerdictFilter === 'ALL' || c.verdict === selectedVerdictFilter;
  });

  const falseCount = report.claims.filter(c => c.verdict === 'FALSE').length;
  const misleadingCount = report.claims.filter(c => c.verdict === 'MISLEADING').length;
  const trueCount = report.claims.filter(c => c.verdict === 'TRUE' || c.verdict === 'MOSTLY_TRUE').length;
  const mixedCount = report.claims.filter(c => c.verdict === 'MIXED').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Verdict Intelligence & Consensus Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic claim verification scorecard and manipulation vector analysis for report <span className="text-cyan-400 font-mono">{report.id}</span>.
          </p>
        </div>

        <button
          onClick={() => onOpenReview()}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-md shadow-violet-600/20 w-fit"
        >
          <FileCheck className="w-4 h-4" />
          <span>Launch Editorial Review Desk</span>
        </button>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0f172a] rounded-2xl border border-rose-900/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-semibold text-rose-400">CONFIRMED FALSE</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {falseCount} <span className="text-xs text-slate-500 font-normal">claims</span>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-2xl border border-orange-900/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-semibold text-orange-400">MISLEADING / SPUN</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {misleadingCount} <span className="text-xs text-slate-500 font-normal">claims</span>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-2xl border border-amber-900/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-semibold text-amber-400">MIXED / NUANCED</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {mixedCount} <span className="text-xs text-slate-500 font-normal">claims</span>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-2xl border border-emerald-900/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-semibold text-emerald-400">VERIFIED ACCURATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {trueCount} <span className="text-xs text-slate-500 font-normal">claims</span>
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {['ALL', 'FALSE', 'MISLEADING', 'MIXED', 'TRUE', 'UNVERIFIABLE'].map((v) => (
          <button
            key={v}
            onClick={() => setSelectedVerdictFilter(v)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedVerdictFilter === v
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {v === 'ALL' ? 'All Assertions' : v}
          </button>
        ))}
      </div>

      {/* Claims Detail Matrix */}
      <div className="space-y-4">
        {filteredClaims.map((claim, idx) => (
          <div
            key={claim.id || idx}
            className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {claim.id}
                </span>
                <span className="text-xs uppercase font-semibold text-slate-400">
                  Category: {claim.category}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                  {claim.verdict}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Confidence: <strong className="text-white">{claim.confidence}%</strong>
                </span>
                <button
                  onClick={() => onOpenReview(claim)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  Edit / Sign Off
                </button>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white leading-snug">
              "{claim.statement}"
            </h3>

            <p className="text-xs text-slate-300 bg-[#090d1a] p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              {claim.explanation}
            </p>

            {claim.decontextualizationFactor && (
              <div className="bg-violet-950/20 border border-violet-900/40 p-2.5 rounded-lg text-xs text-slate-300">
                <span className="font-semibold text-violet-300">Decontextualization Mechanism: </span>
                {claim.decontextualizationFactor}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
