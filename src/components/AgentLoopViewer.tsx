import React from 'react';
import { 
  GitBranch, 
  Search, 
  Eye, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CognitiveStep, CognitivePhase } from '../types/investigation.ts';

interface AgentLoopViewerProps {
  steps: CognitiveStep[];
  isLoading?: boolean;
}

const PHASE_CONFIG: Record<CognitivePhase, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PLAN: {
    label: "PLAN",
    color: "text-violet-400",
    bg: "bg-violet-950/40",
    border: "border-violet-800/60",
    icon: GitBranch,
  },
  ACT: {
    label: "ACT",
    color: "text-cyan-400",
    bg: "bg-cyan-950/40",
    border: "border-cyan-800/60",
    icon: Search,
  },
  OBSERVE: {
    label: "OBSERVE",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-800/60",
    icon: Eye,
  },
  REPLAN: {
    label: "RE-PLAN",
    color: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/60",
    icon: RotateCcw,
  },
  SYNTHESIZE: {
    label: "SYNTHESIZE",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-800/60",
    icon: ShieldCheck,
  },
};

export const AgentLoopViewer: React.FC<AgentLoopViewerProps> = ({ steps, isLoading }) => {
  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Agent Cognitive Loop (Plan → Act → Observe → Re-Plan)
            </h3>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Reasoning in Progress...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-cycle verification trail displaying query decomposition, search tool execution, evidence observation, and adversarial hypothesis re-planning.
          </p>
        </div>

        {/* Phase Pills */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-violet-900/40 text-violet-300 border border-violet-800/50">Plan</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-800/50">Act</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/50">Observe</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-800/50">Re-Plan</span>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
        {steps.map((step, idx) => {
          const config = PHASE_CONFIG[step.phase] || PHASE_CONFIG.PLAN;
          const Icon = config.icon;

          return (
            <div key={step.id || idx} className="relative group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-[37px] sm:-left-[45px] top-1 flex items-center justify-center w-8 h-8 rounded-xl border ${config.border} ${config.bg} shadow-md transition-transform group-hover:scale-110`}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              {/* Step Card */}
              <div className="bg-[#090d1a] border border-slate-800/90 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-colors">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${config.border} ${config.bg} ${config.color}`}>
                      CYCLE {idx + 1}: {config.label}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {step.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="text-emerald-400 font-medium">Completed</span>
                  </div>
                </div>

                {/* Detail */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {step.detail}
                </p>

                {/* Search Queries executed if any */}
                {step.searchQueries && step.searchQueries.length > 0 && (
                  <div className="mt-3 bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                    <span className="text-[10px] uppercase font-mono font-semibold text-cyan-400 tracking-wider block mb-1.5 flex items-center gap-1">
                      <Search className="w-3 h-3" /> Search Queries Dispatched:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {step.searchQueries.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="text-[11px] font-mono bg-slate-950 text-cyan-200 px-2 py-1 rounded border border-cyan-900/40 flex items-center gap-1.5"
                        >
                          <span className="text-cyan-500 font-bold">$</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Findings or observations */}
                {step.findings && step.findings.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-semibold text-amber-400 tracking-wider block flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Observation Insights:
                    </span>
                    <ul className="space-y-1">
                      {step.findings.map((f, fIdx) => (
                        <li
                          key={fIdx}
                          className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-800/60"
                        >
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="relative">
            <div className="absolute -left-[37px] sm:-left-[45px] top-1 flex items-center justify-center w-8 h-8 rounded-xl border border-cyan-700 bg-cyan-950/60 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            </div>
            <div className="bg-[#090d1a]/80 border border-cyan-900/40 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-2/3"></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
