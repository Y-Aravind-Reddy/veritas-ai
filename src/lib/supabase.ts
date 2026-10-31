import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { InvestigationReport, Claim, CognitiveStep, Citation } from '../types/investigation.ts';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid URL and key are provided
export const isSupabaseConfigured = Boolean(
  envUrl && 
  envAnonKey && 
  !envUrl.includes('your-project-id') && 
  !envAnonKey.includes('your-anon-public-key')
);

// Fallback dummy URL/key so createClient doesn't throw if env is missing
const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://dummy-veritas.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? envAnonKey : 'dummy-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface VeritasUserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor' | 'analyst' | 'viewer';
  organization: string;
}

// -------------------------------------------------------------
// Realtime Subscription Helper for Investigations & Agent Events
// -------------------------------------------------------------
export function subscribeToInvestigationUpdates(
  investigationId: string,
  callbacks: {
    onInvestigationChange?: (payload: any) => void;
    onAgentEvent?: (event: CognitiveStep) => void;
    onClaimChange?: (claim: any) => void;
  }
) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel(`investigation-${investigationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'investigations',
        filter: `id=eq.${investigationId}`,
      },
      (payload) => {
        callbacks.onInvestigationChange?.(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_events',
        filter: `investigation_id=eq.${investigationId}`,
      },
      (payload) => {
        const ev = payload.new;
        callbacks.onAgentEvent?.({
          id: ev.id,
          phase: ev.phase,
          title: ev.title,
          detail: ev.detail,
          searchQueries: ev.search_queries || [],
          findings: ev.findings || [],
          timestamp: ev.created_at,
          status: ev.status || 'completed',
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'claims',
        filter: `investigation_id=eq.${investigationId}`,
      },
      (payload) => {
        callbacks.onClaimChange?.(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// -------------------------------------------------------------
// Supabase Database Data Fetchers
// -------------------------------------------------------------
export async function fetchAllSupabaseInvestigations(): Promise<InvestigationReport[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: investigations, error } = await supabase
      .from('investigations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !investigations) return [];

    const reports: InvestigationReport[] = [];
    for (const inv of investigations) {
      const detailed = await fetchSupabaseInvestigation(inv.id);
      if (detailed) {
        reports.push(detailed);
      }
    }
    return reports;
  } catch (err) {
    console.error('Error fetching all investigations from Supabase:', err);
    return [];
  }
}

export async function fetchSupabaseInvestigation(id: string): Promise<InvestigationReport | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: inv, error: invError } = await supabase
      .from('investigations')
      .select('*')
      .eq('id', id)
      .single();

    if (invError || !inv) return null;

    const [claimsRes, sourcesRes, claimSourcesRes, eventsRes, reviewsRes] = await Promise.all([
      supabase.from('claims').select('*').eq('investigation_id', id).order('order_index', { ascending: true }),
      supabase.from('sources').select('*').eq('investigation_id', id),
      supabase.from('claim_sources').select('claim_id, source_id'),
      supabase.from('agent_events').select('*').eq('investigation_id', id).order('created_at', { ascending: true }),
      supabase.from('editorial_reviews').select('*').eq('investigation_id', id).order('reviewed_at', { ascending: false }).limit(1),
    ]);

    const sourceMap = new Map<string, Citation>();
    for (const s of (sourcesRes.data || [])) {
      sourceMap.set(s.id, {
        id: s.id,
        title: s.title,
        url: s.url,
        domain: s.domain,
        publisher: s.publisher,
        reliabilityTier: s.reliability_tier,
      });
    }

    const claimSourceLinks = claimSourcesRes.data || [];

    const claims: Claim[] = (claimsRes.data || []).map((c: any) => {
      // Find sources directly linked through claim_sources join table
      const linkedSourceIds = claimSourceLinks
        .filter((link: any) => link.claim_id === c.id)
        .map((link: any) => link.source_id);

      let claimCitations: Citation[] = [];
      if (linkedSourceIds.length > 0) {
        claimCitations = linkedSourceIds
          .map((sId: string) => sourceMap.get(sId))
          .filter(Boolean) as Citation[];
      } else {
        // Fallback to top sources if no explicit link
        claimCitations = Array.from(sourceMap.values()).slice(0, 3);
      }

      return {
        id: c.id,
        statement: c.statement,
        originalQuoteSnippet: c.quote_snippet,
        category: c.category,
        verdict: c.verdict,
        confidence: c.confidence,
        explanation: c.explanation,
        evidenceSummary: c.evidence_summary || '',
        counterEvidence: c.counter_evidence,
        decontextualizationFactor: c.decontextualization_factor,
        citations: claimCitations,
      };
    });

    const cognitiveTrace: CognitiveStep[] = (eventsRes.data || []).map((e: any) => ({
      id: e.id,
      phase: e.phase,
      title: e.title,
      detail: e.detail,
      searchQueries: e.search_queries || [],
      findings: e.findings || [],
      timestamp: e.created_at,
      status: e.status,
    }));

    const allCitations = Array.from(sourceMap.values()).map((s) => ({
      title: s.title,
      url: s.url,
      domain: s.domain || 'web',
      count: 1,
      reliabilityTier: s.reliabilityTier,
    }));

    const latestReview = reviewsRes.data?.[0];

    return {
      id: inv.id,
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
      sourceText: inv.post_text,
      sourceMetadata: {
        platform: inv.source_platform,
        author: inv.author,
        handle: inv.handle,
        reachEstimate: inv.reach_estimate,
      },
      overallVerdict: inv.overall_verdict || 'MIXED_ACCURACY',
      credibilityScore: inv.credibility_score ?? 50,
      misinformationRisk: inv.misinformation_risk || 'MODERATE',
      executiveSummary: inv.executive_summary || '',
      claims,
      cognitiveTrace,
      allCitations,
      status: inv.status === 'approved' 
        ? 'APPROVED' 
        : inv.status === 'in_progress' 
        ? 'ANALYZING' 
        : 'AWAITING_HUMAN_APPROVAL',
      humanReviewSummary: latestReview ? {
        reviewer: latestReview.reviewer_name,
        decision: latestReview.decision,
        decisionNotes: latestReview.decision_notes || '',
        reviewedAt: latestReview.reviewed_at,
      } : undefined,
      metrics: inv.metrics || {
        durationMs: 3500,
        searchesExecuted: 4,
        sourcesConsulted: allCitations.length,
        claimsCount: claims.length,
        loopCycles: 2,
      },
    };
  } catch (err) {
    console.error('Error fetching investigation from Supabase:', err);
    return null;
  }
}
