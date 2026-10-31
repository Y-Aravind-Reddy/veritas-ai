import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Share2, 
  Download, 
  FileCheck, 
  ExternalLink, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Link,
  Search,
  Activity,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { InvestigationReport, OverallVerdict, MisinformationRisk, Claim } from '../types/investigation.ts';
import { ClaimCard } from './ClaimCard.tsx';

interface ReportViewProps {
  report: InvestigationReport;
  onOpenReview: () => void;
  onOpenClaimReview: (claim: Claim) => void;
  onNewInvestigation: () => void;
}

const OVERALL_VERDICT_CONFIG: Record<OverallVerdict, {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
  colorHex: string;
}> = {
  VERIFIED: {
    label: "VERIFIED ACCURATE",
    badgeBg: "bg-emerald-950/90",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-600",
    icon: ShieldCheck,
    colorHex: "#10b981",
  },
  SUBSTANTIALLY_TRUE: {
    label: "SUBSTANTIALLY ACCURATE",
    badgeBg: "bg-teal-950/90",
    badgeText: "text-teal-300",
    badgeBorder: "border-teal-600",
    icon: ShieldCheck,
    colorHex: "#14b8a6",
  },
  MIXED_ACCURACY: {
    label: "MIXED ACCURACY / CHERRY-PICKED",
    badgeBg: "bg-amber-950/90",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-600",
    icon: AlertTriangle,
    colorHex: "#f59e0b",
  },
  HIGHLY_MISLEADING: {
    label: "HIGHLY MISLEADING",
    badgeBg: "bg-orange-950/90",
    badgeText: "text-orange-300",
    badgeBorder: "border-orange-600",
    icon: ShieldAlert,
    colorHex: "#f97316",
  },
  FABRICATED: {
    label: "FABRICATED / DISINFORMATION",
    badgeBg: "bg-rose-950/90",
    badgeText: "text-rose-300",
    badgeBorder: "border-rose-600",
    icon: ShieldAlert,
    colorHex: "#f43f5e",
  },
  INCONCLUSIVE: {
    label: "INCONCLUSIVE / SPECULATIVE",
    badgeBg: "bg-purple-950/90",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-600",
    icon: AlertTriangle,
    colorHex: "#a855f7",
  },
};

const RISK_BADGES: Record<MisinformationRisk, { label: string; bg: string; text: string; border: string }> = {
  LOW: { label: "LOW RISK", bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-800" },
  MODERATE: { label: "MODERATE RISK", bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-800" },
  HIGH: { label: "HIGH VIRAL RISK", bg: "bg-orange-950/60", text: "text-orange-400", border: "border-orange-800" },
  CRITICAL: { label: "CRITICAL HARM RISK", bg: "bg-rose-950/60", text: "text-rose-400", border: "border-rose-800" },
};

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  onOpenReview,
  onOpenClaimReview,
  onNewInvestigation,
}) => {
  const [copied, setCopied] = useState(false);
  const verdictStyle = OVERALL_VERDICT_CONFIG[report.overallVerdict] || OVERALL_VERDICT_CONFIG.MIXED_ACCURACY;
  const riskBadge = RISK_BADGES[report.misinformationRisk] || RISK_BADGES.MODERATE;
  const VerdictIcon = verdictStyle.icon;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VERITAS_REPORT_${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Audit Stamp */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: verdictStyle.colorHex }}
        />

        {/* Header meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              REPORT: {report.id}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {new Date(report.createdAt).toLocaleString()}
            </span>
            {report.status === 'APPROVED' && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Human Certified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>

            <button
              onClick={onOpenReview}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-violet-900/60 hover:bg-violet-800/80 text-violet-200 border border-violet-700/60 transition-colors font-medium shadow-sm"
            >
              <FileCheck className="w-3.5 h-3.5 text-violet-300" />
              <span>Editorial Approval</span>
            </button>

            <button
              onClick={onNewInvestigation}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Search</span>
            </button>
          </div>
        </div>

        {/* Verdict Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Main Verdict Badge */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wider border ${verdictStyle.badgeBorder} ${verdictStyle.badgeBg} ${verdictStyle.badgeText} shadow-lg`}>
                <VerdictIcon className="w-5 h-5" />
                <span>{verdictStyle.label}</span>
              </div>

              <div className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold tracking-wider border ${riskBadge.border} ${riskBadge.bg} ${riskBadge.text}`}>
                {riskBadge.label}
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Executive Investigation Briefing
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed bg-[#090d1a]/80 p-4 rounded-xl border border-slate-800/80">
              {report.executiveSummary}
            </p>
          </div>

          {/* Credibility Gauge Card */}
          <div className="bg-[#090d1a] rounded-2xl border border-slate-800 p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
              Credibility Index
            </span>

            {/* Circular score display */}
            <div className="relative flex items-center justify-center w-28 h-28 my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${report.credibilityScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke={verdictStyle.colorHex}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {report.credibilityScore}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 gap-2 w-full mt-2 text-[11px] font-mono">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-400">
                <span>Claims: </span>
                <strong className="text-slate-200">{report.claims.length}</strong>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-400">
                <span>Latency: </span>
                <strong className="text-slate-200">{report.metrics.durationMs}ms</strong>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-400">
                <span>Searches: </span>
                <strong className="text-slate-200">{report.metrics.searchesExecuted}</strong>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-400">
                <span>Sources: </span>
                <strong className="text-slate-200">{report.allCitations.length}</strong>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Original Source Post Box */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Original Ingested Submission ({report.sourceMetadata.platform}):
          </span>
          {report.sourceMetadata.handle && (
            <span className="font-mono text-cyan-400">{report.sourceMetadata.handle}</span>
          )}
        </div>
        <div className="p-3 bg-[#090d1a] rounded-lg border border-slate-800/80 text-sm text-slate-200 italic font-sans leading-relaxed">
          "{report.sourceText}"
        </div>
      </div>

      {/* Section: Atomic Claims Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Claim-by-Claim Verification Breakdown ({report.claims.length})
            </h2>
            <p className="text-xs text-slate-400">
              Each distinct factual assertion extracted from the source, evaluated independently against grounded evidence.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {report.claims.map((claim, idx) => (
            <ClaimCard
              key={claim.id || idx}
              claim={claim}
              index={idx}
              onOpenReview={onOpenClaimReview}
            />
          ))}
        </div>
      </div>

      {/* Section: Verified Citations Matrix */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-violet-400" />
              Consulted Primary & Verified Sources ({report.allCitations.length})
            </h3>
            <p className="text-xs text-slate-400">
              Real web sources discovered and parsed by Gemini Search Grounding during the investigation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.allCitations.map((cite, idx) => (
            <a
              key={idx}
              href={cite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between p-3 rounded-xl bg-[#090d1a] border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 line-clamp-2">
                    {cite.title || cite.domain}
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 truncate max-w-[150px]">{cite.domain}</span>
                <span className="text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-900/40">
                  {cite.count} ref{cite.count > 1 ? 's' : ''}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Editorial Certification stamp if approved */}
      {report.humanReviewSummary && (
        <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-900 border border-violet-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white tracking-wide">
                HUMAN-IN-THE-LOOP EDITORIAL CERTIFICATION
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              Certified by: <strong className="text-violet-300">{report.humanReviewSummary.reviewer}</strong> on {new Date(report.humanReviewSummary.reviewedAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-400 italic">
              "{report.humanReviewSummary.decisionNotes}"
            </p>
          </div>

          <button
            onClick={onOpenReview}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-violet-800/70 hover:bg-violet-700 text-white font-medium transition-colors"
          >
            Modify Editorial Review
          </button>
        </div>
      )}

    </div>
  );
};
