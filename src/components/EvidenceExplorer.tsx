import React, { useState } from 'react';
import { 
  Link2, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  Search, 
  Filter, 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  Scale, 
  ChevronRight 
} from 'lucide-react';
import { InvestigationReport, ReliabilityTier, Citation } from '../types/investigation.ts';

interface EvidenceExplorerProps {
  report: InvestigationReport;
}

const TIER_META: Record<ReliabilityTier, { label: string; badge: string; color: string; desc: string }> = {
  OFFICIAL: {
    label: "Official Government / Agency",
    badge: "bg-sky-950/80 text-sky-300 border-sky-800",
    color: "#0284c7",
    desc: "Primary state departments, central banks, and regulatory bodies (e.g., .gov, federalreserve.gov, who.int)."
  },
  ACADEMIC: {
    label: "Peer-Reviewed Scientific",
    badge: "bg-indigo-950/80 text-indigo-300 border-indigo-800",
    color: "#6366f1",
    desc: "Scientific publications, clinical registries, and research institutions (e.g., NIH, PubMed, Nature)."
  },
  FACT_CHECKER: {
    label: "Certified Fact-Checking Desk",
    badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
    color: "#10b981",
    desc: "Signatories of the International Fact-Checking Network (e.g., Snopes, PolitiFact, Full Fact)."
  },
  NEWS_WIRE: {
    label: "Major News Wire Syndicate",
    badge: "bg-cyan-950/80 text-cyan-300 border-cyan-800",
    color: "#06b6d4",
    desc: "Direct primary news wires with editorial verification standards (e.g., Reuters, AP News, Bloomberg)."
  },
  PRIMARY: {
    label: "Primary Public Record",
    badge: "bg-violet-950/80 text-violet-300 border-violet-800",
    color: "#8b5cf6",
    desc: "Original SEC Form 4 filings, judicial court dockets, statutory laws, and official meeting minutes."
  },
  COMMUNITY: {
    label: "General Web Citation",
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    color: "#64748b",
    desc: "Web articles, press reports, and digital commentary."
  },
};

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({ report }) => {
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all sources from claims and report
  const allSources: Citation[] = [];
  const seenUrls = new Set<string>();

  for (const c of report.allCitations || []) {
    if (!seenUrls.has(c.url.toLowerCase())) {
      seenUrls.add(c.url.toLowerCase());
      allSources.push({
        title: c.title,
        url: c.url,
        domain: c.domain,
        reliabilityTier: c.reliabilityTier || 'COMMUNITY',
      });
    }
  }

  for (const claim of report.claims || []) {
    for (const cite of claim.citations || []) {
      if (!seenUrls.has(cite.url.toLowerCase())) {
        seenUrls.add(cite.url.toLowerCase());
        allSources.push(cite);
      }
    }
  }

  const filtered = allSources.filter((s) => {
    const matchesTier = tierFilter === 'ALL' || s.reliabilityTier === tierFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.domain && s.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.publisher && s.publisher.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Evidence Dossier & Source Authority Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-examined grounding citations, authority tiers, and primary registries backing report <span className="text-cyan-400 font-mono">{report.id}</span>.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          Total Sources Consulted: <strong className="text-cyan-400">{allSources.length}</strong>
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search domain, publisher or source headline..."
            className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-[#090d1a] border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Authority Tiers</option>
          <option value="OFFICIAL">Official / Government</option>
          <option value="ACADEMIC">Peer-Reviewed Academic</option>
          <option value="FACT_CHECKER">Certified Fact-Checkers</option>
          <option value="NEWS_WIRE">Major News Wires</option>
          <option value="PRIMARY">Primary Records</option>
          <option value="COMMUNITY">Web Citations</option>
        </select>
      </div>

      {/* Sources Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No matching sources found</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filter or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((source, idx) => {
            const tier = source.reliabilityTier || 'COMMUNITY';
            const meta = TIER_META[tier] || TIER_META.COMMUNITY;

            return (
              <div
                key={idx}
                className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {source.domain}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                    {source.title || source.domain}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {source.snippet || meta.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{source.publisher || source.domain}</span>
                  </div>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium group/link"
                  >
                    <span>Inspect Source</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
