import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Database,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { profile, user, signInDemoUser, signOutUser } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase URL and Anon Key are not yet configured in environment. Use Demo Roles to test authentication.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatusMessage("Signed in successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase URL and Anon Key are not yet configured in environment. Use Demo Roles to test authentication.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      setStatusMessage("Account created! Check your email for confirmation link.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#090d1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-950 border border-violet-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                VERITAS AI Authentication
              </h3>
              <p className="text-xs text-slate-400">
                Supabase Auth & Enterprise Role Access
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => { setTab('demo'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'demo' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Role Personas
          </button>
          <button
            onClick={() => { setTab('signin'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'signin' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Supabase Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'signup' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Current Active User Card */}
          {profile && (
            <div className="bg-[#090d1a] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{profile.full_name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800">
                    {profile.role}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{profile.email}</span>
              </div>
              <button
                onClick={signOutUser}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* TAB: DEMO PERSONAS */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Select an Enterprise Role to Test Verification & Approvals:
              </span>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    signInDemoUser('editor');
                    setStatusMessage("Switched to Elena Vance (Senior Editor)!");
                    setTimeout(() => onClose(), 800);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#090d1a] border border-slate-800 hover:border-violet-500/60 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">
                      Elena Vance (Senior Fact-Checker & Editor)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Full review authority, verdict overrides, and editorial certification stamp.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                    Editor
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signInDemoUser('admin');
                    setStatusMessage("Switched to Dr. Sarah Connor (Admin / Director)!");
                    setTimeout(() => onClose(), 800);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#090d1a] border border-slate-800 hover:border-violet-500/60 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">
                      Dr. Sarah Connor (Chief Compliance Officer)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      System admin, RLS bypass policy manager, audit trail supervisor.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signInDemoUser('analyst');
                    setStatusMessage("Switched to Marcus Wei (Cognitive Analyst)!");
                    setTimeout(() => onClose(), 800);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#090d1a] border border-slate-800 hover:border-violet-500/60 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">
                      Marcus Wei (Investigation Analyst)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Launches investigations, inspects grounding sources, traces claims.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Analyst
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: SUPABASE SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@veritas.ai"
                    className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-60"
              >
                {isLoading ? "Authenticating with Supabase..." : "Sign In via Supabase Auth"}
              </button>
            </form>
          )}

          {/* TAB: REGISTER */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@organization.com"
                    className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#090d1a] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-60"
              >
                {isLoading ? "Creating Profile..." : "Create Account"}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
