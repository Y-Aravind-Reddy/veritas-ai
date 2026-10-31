import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { InvestigationReport, OverallVerdict, MisinformationRisk } from '../types/investigation.ts';

interface ArchiveViewProps {
  reports: InvestigationReport[];
  onSelectReport: (report: InvestigationReport) => void;
  onDeleteReport: (id: string) => Promise<void>;
  onResetArchive: () => Promise<void>;
}

const VERDICT_CONFIG: Record<OverallVerdict, { label: string; text: string; bg: string; border: string }> = {
  VERIFIED: { label: "Verified True", text: "text-emerald-400", bg: "bg-emerald-950/60", border: "border-emerald-800" },
  SUBSTANTIALLY_TRUE: { label: "Substantially True", text: "text-teal-400", bg: "bg-teal-950/60", border: "border-teal-800" },
  MIXED_ACCURACY: { label: "Mixed / Nuanced", text: "text-amber-400", bg: "bg-amber-950/60", border: "border-amber-800" },
  HIGHLY_MISLEADING: { label: "Misleading", text: "text-orange-400", bg: "bg-orange-950/60", border: "border-orange-800" },
  FABRICATED: { label: "Fabricated", text: "text-rose-400", bg: "bg-rose-950/60", border: "border-rose-800" },
  INCONCLUSIVE: { label: "Inconclusive", text: "text-purple-400", bg: "bg-purple-950/60", border: "border-purple-800" },
};

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onResetArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filtered = reports.filter((r) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      r.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerdict = verdictFilter === 'ALL' || r.overallVerdict === verdictFilter;
    const matchesRisk = riskFilter === 'ALL' || r.misinformationRisk === riskFilter;

    return matchesQuery && matchesVerdict && matchesRisk;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Investigation Records & Intelligence Archive
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical repository of all automated investigations, human certifications, and evidence dossiers.
          </p>
        </div>

        <button
          onClick={onResetArchive}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset Sample Cases</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, headlines, or report IDs..."
            className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Verdict Filter */}
        <select
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="bg-[#090d1a] border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Verdicts</option>
          <option value="VERIFIED">Verified True</option>
          <option value="SUBSTANTIALLY_TRUE">Substantially True</option>
          <option value="MIXED_ACCURACY">Mixed Accuracy</option>
          <option value="HIGHLY_MISLEADING">Highly Misleading</option>
          <option value="FABRICATED">Fabricated / Disinformation</option>
        </select>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-[#090d1a] border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Risk Tiers</option>
          <option value="LOW">Low Risk</option>
          <option value="MODERATE">Moderate Risk</option>
          <option value="HIGH">High Risk</option>
          <option value="CRITICAL">Critical Risk</option>
        </select>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No matching investigation reports found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search filters or start a new investigation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const verdictInfo = VERDICT_CONFIG[report.overallVerdict] || VERDICT_CONFIG.MIXED_ACCURACY;

            return (
              <div
                key={report.id}
                className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {report.id}
                    </span>

                    <span className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold border ${verdictInfo.bg} ${verdictInfo.text} ${verdictInfo.border}`}>
                      {verdictInfo.label}
                    </span>

                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Score: <strong className="text-white">{report.credibilityScore}/100</strong>
                    </span>

                    {report.status === 'APPROVED' && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Human Certified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(report.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Snippet */}
                <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 mb-1">
                  "{report.sourceText}"
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {report.executiveSummary}
                </p>

                {/* Footer and CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>Platform: <strong className="text-slate-300">{report.sourceMetadata.platform}</strong></span>
                    <span>Claims: <strong className="text-slate-300">{report.claims.length}</strong></span>
                    <span>Sources: <strong className="text-slate-300">{report.allCitations.length}</strong></span>
                  </div>

                  <button
                    onClick={() => onSelectReport(report)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 group-hover:bg-cyan-950 group-hover:text-cyan-300 text-slate-300 border border-slate-700 group-hover:border-cyan-800 transition-colors font-medium text-xs"
                  >
                    <span>Inspect Investigation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
