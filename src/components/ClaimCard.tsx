import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  Bookmark, 
  UserCheck, 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Sparkles,
  Link2
} from 'lucide-react';
import { Claim, ClaimVerdict, ReliabilityTier } from '../types/investigation.ts';

interface ClaimCardProps {
  claim: Claim;
  index: number;
  onOpenReview?: (claim: Claim) => void;
}

const VERDICT_STYLES: Record<ClaimVerdict, {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  barColor: string;
  icon: any;
}> = {
  TRUE: {
    label: "VERIFIED TRUE",
    badgeBg: "bg-emerald-950/80",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-600/60",
    cardBorder: "hover:border-emerald-700/60",
    barColor: "bg-emerald-500",
    icon: CheckCircle2,
  },
  MOSTLY_TRUE: {
    label: "SUBSTANTIALLY TRUE",
    badgeBg: "bg-teal-950/80",
    badgeText: "text-teal-300",
    badgeBorder: "border-teal-600/60",
    cardBorder: "hover:border-teal-700/60",
    barColor: "bg-teal-500",
    icon: CheckCircle2,
  },
  MIXED: {
    label: "MIXED ACCURACY",
    badgeBg: "bg-amber-950/80",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-600/60",
    cardBorder: "hover:border-amber-700/60",
    barColor: "bg-amber-500",
    icon: AlertTriangle,
  },
  MISLEADING: {
    label: "MISLEADING / DISTORTED",
    badgeBg: "bg-orange-950/80",
    badgeText: "text-orange-300",
    badgeBorder: "border-orange-600/60",
    cardBorder: "hover:border-orange-700/60",
    barColor: "bg-orange-500",
    icon: AlertTriangle,
  },
  FALSE: {
    label: "CONFIRMED FALSE",
    badgeBg: "bg-rose-950/80",
    badgeText: "text-rose-300",
    badgeBorder: "border-rose-600/60",
    cardBorder: "hover:border-rose-700/60",
    barColor: "bg-rose-500",
    icon: XCircle,
  },
  UNVERIFIABLE: {
    label: "UNVERIFIABLE / SPECULATIVE",
    badgeBg: "bg-purple-950/80",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-600/60",
    cardBorder: "hover:border-purple-700/60",
    barColor: "bg-purple-500",
    icon: HelpCircle,
  },
};

const TIER_BADGES: Record<ReliabilityTier, { text: string; bg: string; color: string }> = {
  OFFICIAL: { text: "Official / Agency", bg: "bg-sky-950/90", color: "text-sky-300 border-sky-800" },
  ACADEMIC: { text: "Peer-Reviewed", bg: "bg-indigo-950/90", color: "text-indigo-300 border-indigo-800" },
  FACT_CHECKER: { text: "Verified Fact-Checker", bg: "bg-emerald-950/90", color: "text-emerald-300 border-emerald-800" },
  NEWS_WIRE: { text: "Major News Wire", bg: "bg-cyan-950/90", color: "text-cyan-300 border-cyan-800" },
  PRIMARY: { text: "Primary Document", bg: "bg-violet-950/90", color: "text-violet-300 border-violet-800" },
  COMMUNITY: { text: "Web Citation", bg: "bg-slate-800", color: "text-slate-300 border-slate-700" },
};

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, index, onOpenReview }) => {
  const [expanded, setExpanded] = useState(true);
  const style = VERDICT_STYLES[claim.verdict] || VERDICT_STYLES.MIXED;
  const Icon = style.icon;

  return (
    <div className={`bg-[#0f172a] rounded-2xl border border-slate-800/80 shadow-md transition-all ${style.cardBorder} overflow-hidden mb-5`}>
      
      {/* Top Banner / Verdict Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-[#0f172a]">
        
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            CLAIM #{index + 1}
          </span>
          <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50">
            {claim.category}
          </span>

          {/* Individual Verdict Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide border ${style.badgeBorder} ${style.badgeBg} ${style.badgeText} shadow-sm`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{style.label}</span>
          </div>

          {/* Human Review Status Badge */}
          {claim.humanReview && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-700/60">
              <UserCheck className="w-3 h-3 text-violet-400" />
              Reviewed by {claim.humanReview.reviewerName || 'Editor'}
            </span>
          )}
        </div>

        {/* Confidence & Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Confidence:</span>
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className={`h-full ${style.barColor}`}
                style={{ width: `${claim.confidence}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">{claim.confidence}%</span>
          </div>

          {onOpenReview && (
            <button
              onClick={() => onOpenReview(claim)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            >
              Editorial Review
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-200"
            aria-label="Toggle claim details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Claim Body */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* Claim Statement */}
        <div>
          <h3 className="text-base font-semibold text-slate-100 leading-snug">
            "{claim.statement}"
          </h3>
          {claim.originalQuoteSnippet && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 italic">
              <Quote className="w-3 h-3 text-slate-500 shrink-0" />
              <span>Extracted from: "{claim.originalQuoteSnippet}"</span>
            </div>
          )}
        </div>

        {/* Factual Explanation */}
        <div className="bg-[#090d1a] rounded-xl p-3.5 border border-slate-800/90 text-sm text-slate-300 leading-relaxed">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Verification Analysis:
          </span>
          <p>{claim.explanation}</p>
        </div>

        {expanded && (
          <>
            {/* Grid for Evidence vs Counter-Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Confirmed Evidence */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Grounding Proof & Verified Facts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {claim.evidenceSummary}
                </p>
              </div>

              {/* Counter-Evidence or Nuances */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Disproving Factors & Contradictions</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {claim.counterEvidence || "No direct authenticating records exist to support this assertion in institutional registries or news wire databases."}
                </p>
              </div>
            </div>

            {/* Decontextualization / Spin Breakdown if available */}
            {claim.decontextualizationFactor && (
              <div className="bg-violet-950/20 border border-violet-900/40 rounded-xl p-3">
                <span className="text-xs font-semibold text-violet-300 block mb-1">
                  Decontextualization & Manipulation Technique:
                </span>
                <p className="text-xs text-slate-300">
                  {claim.decontextualizationFactor}
                </p>
              </div>
            )}

            {/* Citations & Sources */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  Live Citations & Grounding Sources ({claim.citations.length}):
                </span>
              </div>

              {claim.citations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {claim.citations.map((cite, cIdx) => {
                    const tier = cite.reliabilityTier || 'COMMUNITY';
                    const tierBadge = TIER_BADGES[tier] || TIER_BADGES.COMMUNITY;

                    return (
                      <a
                        key={cIdx}
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between p-2.5 rounded-lg bg-[#090d1a] border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all text-xs"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="font-medium text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                            {cite.title || cite.domain}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-auto">
                          <span className="text-[11px] font-mono text-slate-400 truncate">
                            {cite.domain || (cite.url ? new URL(cite.url).hostname : 'source')}
                          </span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${tierBadge.bg} ${tierBadge.color} shrink-0`}>
                            {tierBadge.text}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Search query confirmed absence of any primary records for this specific assertion.
                </p>
              )}
            </div>

            {/* Human Editorial Note if available */}
            {claim.humanReview?.notes && (
              <div className="bg-slate-900 border-l-2 border-violet-500 p-2.5 rounded-r text-xs text-slate-300">
                <span className="font-semibold text-violet-300">Editor Note: </span>
                {claim.humanReview.notes}
              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
};
