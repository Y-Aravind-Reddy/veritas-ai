export type ClaimVerdict = 
  | 'TRUE' 
  | 'MOSTLY_TRUE' 
  | 'MIXED' 
  | 'MISLEADING' 
  | 'FALSE' 
  | 'UNVERIFIABLE';

export type ClaimCategory = 
  | 'statistic' 
  | 'quote' 
  | 'event' 
  | 'scientific' 
  | 'legal' 
  | 'policy' 
  | 'media';

export type ReliabilityTier = 
  | 'PRIMARY' 
  | 'OFFICIAL' 
  | 'NEWS_WIRE' 
  | 'ACADEMIC' 
  | 'FACT_CHECKER' 
  | 'COMMUNITY';

export interface Citation {
  id?: string;
  title: string;
  url: string;
  snippet?: string;
  publisher?: string;
  domain?: string;
  reliabilityTier?: ReliabilityTier;
  publishedDate?: string;
}

export interface HumanReviewData {
  status: 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN' | 'FLAGGED';
  overrideVerdict?: ClaimVerdict;
  notes?: string;
  reviewerName?: string;
  reviewedAt?: string;
}

export interface Claim {
  id: string;
  statement: string;
  originalQuoteSnippet?: string;
  category: ClaimCategory;
  verdict: ClaimVerdict;
  confidence: number; // 0-100
  explanation: string;
  evidenceSummary: string;
  counterEvidence?: string;
  decontextualizationFactor?: string; // how the claim was spun, clipped or altered
  citations: Citation[];
  humanReview?: HumanReviewData;
}

export type CognitivePhase = 'PLAN' | 'ACT' | 'OBSERVE' | 'REPLAN' | 'SYNTHESIZE';

export interface CognitiveStep {
  id: string;
  phase: CognitivePhase;
  title: string;
  detail: string;
  searchQueries?: string[];
  findings?: string[];
  timestamp: string;
  claimId?: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export type OverallVerdict = 
  | 'VERIFIED' 
  | 'SUBSTANTIALLY_TRUE' 
  | 'MIXED_ACCURACY' 
  | 'HIGHLY_MISLEADING' 
  | 'FABRICATED' 
  | 'INCONCLUSIVE';

export type MisinformationRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface SourceMetadata {
  platform: 'X / Twitter' | 'Facebook' | 'Reddit' | 'TikTok' | 'News Article' | 'Direct Input' | 'Telegram';
  author?: string;
  handle?: string;
  timestamp?: string;
  reachEstimate?: string;
  engagement?: {
    likes?: string;
    reposts?: string;
    views?: string;
  };
}

export interface InvestigationReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceText: string;
  sourceMetadata: SourceMetadata;
  overallVerdict: OverallVerdict;
  credibilityScore: number; // 0-100
  misinformationRisk: MisinformationRisk;
  executiveSummary: string;
  claims: Claim[];
  cognitiveTrace: CognitiveStep[];
  allCitations: Array<{
    title: string;
    url: string;
    domain: string;
    snippet?: string;
    count: number;
    reliabilityTier?: ReliabilityTier;
  }>;
  status: 'ANALYZING' | 'COMPLETED' | 'AWAITING_HUMAN_APPROVAL' | 'APPROVED' | 'REVISION_REQUESTED';
  humanReviewSummary?: {
    reviewer: string;
    decision: 'APPROVED' | 'REJECTED' | 'MODIFIED';
    decisionNotes: string;
    reviewedAt: string;
  };
  metrics: {
    durationMs: number;
    searchesExecuted: number;
    sourcesConsulted: number;
    claimsCount: number;
    loopCycles: number;
  };
}

export interface EvaluationMetrics {
  totalInvestigations: number;
  totalClaimsChecked: number;
  averageCredibilityScore: number;
  averageLatencyMs: number;
  verdictDistribution: Record<ClaimVerdict, number>;
  riskDistribution: Record<MisinformationRisk, number>;
  topDomains: Array<{ domain: string; count: number }>;
  humanInterventionRate: number; // percentage
  cognitiveCyclesAvg: number;
}
