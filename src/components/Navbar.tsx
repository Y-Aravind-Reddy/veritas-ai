import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  History, 
  FileCheck, 
  Search, 
  Workflow, 
  User, 
  Link2, 
  Scale, 
  Database,
  Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface NavbarProps {
  activeTab: 'workspace' | 'archive' | 'review' | 'evaluation' | 'agent' | 'evidence' | 'verdict';
  setActiveTab: (tab: 'workspace' | 'archive' | 'review' | 'evaluation' | 'agent' | 'evidence' | 'verdict') => void;
  systemStatus: {
    geminiConfigured: boolean;
    investigationCount: number;
  };
  onQuickSampleSelect: (sampleKey: string) => void;
  isInvestigating: boolean;
  onOpenAuthModal: () => void;
  onOpenN8nModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  onQuickSampleSelect,
  isInvestigating,
  onOpenAuthModal,
  onOpenN8nModal,
}) => {
  const { profile, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080c16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#090d1a] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080c16]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  VERITAS <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/50 tracking-wider">
                  Supabase + n8n
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block">
                Cognitive Fact-Checking & Misinformation Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'workspace'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Investigation
            </button>

            <button
              onClick={() => setActiveTab('verdict')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'verdict'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Verdict Center
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'evidence'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Evidence
            </button>

            <button
              onClick={() => setActiveTab('agent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'agent'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Agent Loop
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'review'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              HITL Review
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'archive'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Archive
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
                {systemStatus.investigationCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
          </nav>

          {/* Quick Actions & Integration Hub */}
          <div className="flex items-center gap-2.5">
            {/* n8n Integration Hub Button */}
            <button
              onClick={onOpenN8nModal}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition-colors shadow-sm"
              title="Open n8n Webhook & Supabase Integration Specs"
            >
              <Workflow className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-mono">n8n Hub</span>
            </button>

            {/* Quick Demo Pre-load */}
            <div className="relative hidden xl:block">
              <select
                disabled={isInvestigating}
                onChange={(e) => {
                  if (e.target.value) {
                    onQuickSampleSelect(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
                defaultValue=""
              >
                <option value="" disabled>Load Case Study...</option>
                <option value="rate_cut">Fed Rate Cut Emergency Memo (Finance)</option>
                <option value="microplastics">Tokyo Clove Microplastics Cure (Health)</option>
                <option value="asteroid">NASA Hidden Asteroid Trajectory (Science)</option>
              </select>
            </div>

            {/* Auth / Role Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {profile?.role?.[0] || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[11px] font-semibold text-slate-200 block line-clamp-1 leading-none">
                  {profile?.full_name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-[9px] uppercase font-mono text-cyan-400 leading-none">
                  {profile?.role || 'analyst'}
                </span>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Tab Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'workspace' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Investigation
          </button>
          <button
            onClick={() => setActiveTab('verdict')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'verdict' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Verdict Center
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'evidence' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Evidence
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'agent' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Agent Loop
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'review' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            HITL Review
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'archive' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Archive ({systemStatus.investigationCount})
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'evaluation' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
            }`}
          >
            Analytics
          </button>
        </div>

      </div>
    </header>
  );
};
