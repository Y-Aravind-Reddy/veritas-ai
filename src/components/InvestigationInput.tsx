import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Layers, 
  Globe, 
  Cpu, 
  Flame, 
  AlertCircle,
  FileText,
  Twitter,
  Share2
} from 'lucide-react';
import { SourceMetadata } from '../types/investigation.ts';

interface InvestigationInputProps {
  onSubmit: (data: {
    text: string;
    platform: SourceMetadata['platform'];
    author?: string;
    handle?: string;
  }) => void;
  isLoading: boolean;
}

const SAMPLE_PRESETS = [
  {
    label: "Fed Emergency Rate Cut",
    category: "Finance",
    platform: "X / Twitter" as const,
    author: "MarketWatchLeaks",
    handle: "@market_insider_alpha",
    text: "BREAKING: Internal Federal Reserve memo leaked showing emergency 100bps interest rate cut scheduled for Monday morning due to severe regional banking liquidity collapse. Insiders already dumping bank stocks!"
  },
  {
    label: "Tokyo Microplastics Cure",
    category: "Health",
    platform: "TikTok" as const,
    author: "HolisticBioHacker",
    handle: "@biohack_daily",
    text: "Scientists in Tokyo have officially confirmed that drinking 3 cups of green tea with crushed cloves destroys 99.8% of microplastics inside human blood vessels in under 48 hours. Medical industry is suppressing this cheap cure!"
  },
  {
    label: "NASA Asteroid Cover-up",
    category: "Science",
    platform: "Reddit" as const,
    author: "AstroTruthor",
    handle: "u/deepsky_insider",
    text: "Leaked telemetry from James Webb and NASA Sentry shows 2026-FT4 is on direct collision course with Pacific Ocean on Nov 14. Classified memo orders staff to silence public telescope access."
  },
  {
    label: "EV Arctic Battery Ban",
    category: "Policy",
    platform: "Facebook" as const,
    author: "AutoPolicyWatch",
    handle: "AutoPolicyWatch",
    text: "Nordic Transport Authority just passed emergency law banning all electric vehicles from highways whenever temperatures drop below -10°C after lithium batteries experienced spontaneous thermal mass failure."
  }
];

export const InvestigationInput: React.FC<InvestigationInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState<SourceMetadata['platform']>('X / Twitter');
  const [author, setAuthor] = useState('');
  const [handle, setHandle] = useState('');
  const [showMetadataFields, setShowMetadataFields] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 20 || text.trim().length > 12000 || isLoading) return;
    onSubmit({
      text: text.trim(),
      platform,
      author: author.trim() || undefined,
      handle: handle.trim() || undefined
    });
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setText(preset.text);
    setPlatform(preset.platform);
    setAuthor(preset.author);
    setHandle(preset.handle);
    setShowMetadataFields(true);
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-5 sm:p-6 mb-8">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            <h2 className="text-base font-semibold text-white tracking-wide">
              Ingest Viral Post / Source Statement
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit any viral tweet, news claim, screenshot transcript, or forward. Gemini will extract claims and execute grounded search verification.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleApplyPreset(p)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="Paste viral social media post, breaking headline, quotes, or controversial assertion here..."
            className="w-full bg-[#090d1a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-y disabled:opacity-60"
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>Minimum 20 characters (up to 12,000 characters) for claim extraction</span>
            <span className={text.trim().length > 0 && text.trim().length < 20 ? "text-amber-400 font-medium" : ""}>
              {text.length} / 12,000 characters {text.trim().length > 0 && text.trim().length < 20 && `(need ${20 - text.trim().length} more)`}
            </span>
          </div>
        </div>

        {/* Source metadata toggle & options */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/70">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Source Platform:</span>
              <div className="flex flex-wrap gap-1">
                {(['X / Twitter', 'TikTok', 'Facebook', 'Reddit', 'Telegram', 'News Article'] as const).map((plt) => (
                  <button
                    key={plt}
                    type="button"
                    onClick={() => setPlatform(plt)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      platform === plt
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/70 font-medium'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                    }`}
                  >
                    {plt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMetadataFields(!showMetadataFields)}
              className="text-slate-400 hover:text-cyan-300 text-xs underline decoration-slate-600 underline-offset-4"
            >
              {showMetadataFields ? 'Hide Author Details' : '+ Add Author / Origin Handle'}
            </button>
          </div>

          {showMetadataFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Author / Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. BreakingMarketsNow"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#090d1a] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account Handle or Channel ID</label>
                <input
                  type="text"
                  placeholder="e.g. @breaking_wire"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-[#090d1a] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button & Architecture Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Plan → Act → Observe → Re-Plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Google Search Grounding</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={text.trim().length < 20 || text.trim().length > 12000 || isLoading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
              text.trim().length < 20 || text.trim().length > 12000 || isLoading
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-indigo-600/30 hover:shadow-cyan-500/20 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Investigating Claims with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Launch Fact-Check Investigation</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
