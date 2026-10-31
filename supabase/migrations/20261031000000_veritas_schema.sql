-- ==============================================================================
-- VERITAS AI: Enterprise Misinformation Intelligence & Fact-Checking Platform
-- Database Schema, Custom Enums, Foreign Keys, RLS Policies & Realtime Setup
-- ==============================================================================

-- 1. Custom Types & Enums
DO $$ BEGIN
  CREATE TYPE investigation_status AS ENUM (
    'queued',
    'in_progress',
    'completed',
    'review_pending',
    'approved',
    'rejected',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE claim_verdict AS ENUM (
    'TRUE',
    'MOSTLY_TRUE',
    'MIXED',
    'MISLEADING',
    'FALSE',
    'UNVERIFIABLE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE claim_category AS ENUM (
    'statistic',
    'quote',
    'event',
    'scientific',
    'legal',
    'policy',
    'media'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE misinformation_risk AS ENUM (
    'LOW',
    'MODERATE',
    'HIGH',
    'CRITICAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE overall_verdict AS ENUM (
    'VERIFIED',
    'SUBSTANTIALLY_TRUE',
    'MIXED_ACCURACY',
    'HIGHLY_MISLEADING',
    'FABRICATED',
    'INCONCLUSIVE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE reliability_tier AS ENUM (
    'PRIMARY',
    'OFFICIAL',
    'NEWS_WIRE',
    'ACADEMIC',
    'FACT_CHECKER',
    'COMMUNITY'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cognitive_phase AS ENUM (
    'PLAN',
    'ACT',
    'OBSERVE',
    'REPLAN',
    'SYNTHESIZE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE review_decision AS ENUM (
    'APPROVED',
    'REJECTED',
    'MODIFIED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'editor',
    'analyst',
    'viewer'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role user_role NOT NULL DEFAULT 'analyst',
  organization TEXT DEFAULT 'VERITAS Intelligence Network',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Investigations Table
CREATE TABLE IF NOT EXISTS public.investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  post_text TEXT NOT NULL,
  source_platform TEXT NOT NULL DEFAULT 'X / Twitter',
  language TEXT NOT NULL DEFAULT 'en',
  author TEXT,
  handle TEXT,
  reach_estimate TEXT,
  status investigation_status NOT NULL DEFAULT 'queued',
  overall_verdict overall_verdict,
  credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
  misinformation_risk misinformation_risk NOT NULL DEFAULT 'MODERATE',
  executive_summary TEXT,
  metrics JSONB NOT NULL DEFAULT '{"durationMs": 0, "searchesExecuted": 0, "sourcesConsulted": 0, "loopCycles": 1}'::jsonb,
  raw_n8n_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Claims Table (Discrete Atomic Claims)
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  quote_snippet TEXT,
  category claim_category NOT NULL DEFAULT 'event',
  verdict claim_verdict NOT NULL DEFAULT 'MIXED',
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100) DEFAULT 75,
  explanation TEXT NOT NULL,
  evidence_summary TEXT,
  counter_evidence TEXT,
  decontextualization_factor TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Sources Table (Grounding Citations & URLs)
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  publisher TEXT,
  reliability_tier reliability_tier NOT NULL DEFAULT 'COMMUNITY',
  snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Claim Sources Join Table
CREATE TABLE IF NOT EXISTS public.claim_sources (
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  PRIMARY KEY (claim_id, source_id)
);

-- 7. Agent Events Table (Plan-Act-Observe-Replan Cognitive Trail)
CREATE TABLE IF NOT EXISTS public.agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  phase cognitive_phase NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  search_queries TEXT[],
  findings TEXT[],
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Editorial Reviews Table (Human-in-the-Loop Signoff)
CREATE TABLE IF NOT EXISTS public.editorial_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  decision review_decision NOT NULL,
  decision_notes TEXT,
  claim_reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_investigation_id ON public.claims(investigation_id);
CREATE INDEX IF NOT EXISTS idx_sources_investigation_id ON public.sources(investigation_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_investigation_id ON public.agent_events(investigation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_editorial_reviews_investigation_id ON public.editorial_reviews(investigation_id);
CREATE INDEX IF NOT EXISTS idx_claim_sources_claim_id ON public.claim_sources(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_sources_source_id ON public.claim_sources(source_id);

-- 10. Automatic Trigger to Handle New Users -> Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'analyst'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Trigger for Updated At on investigations
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_investigations_updated_at ON public.investigations;
CREATE TRIGGER trigger_investigations_updated_at
  BEFORE UPDATE ON public.investigations
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- 12. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Investigations Policies
CREATE POLICY "Investigations are readable by everyone"
  ON public.investigations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users or service role can create investigations"
  ON public.investigations FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Editors, creators, or service role can update investigations"
  ON public.investigations FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins or owners can delete investigations"
  ON public.investigations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

-- Claims, Sources, Agent Events Policies (Cascade read/write)
CREATE POLICY "Claims are readable by everyone"
  ON public.claims FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Claims can be inserted by authenticated users or service role"
  ON public.claims FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Claims can be updated by editors or service role"
  ON public.claims FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Sources are readable by everyone"
  ON public.sources FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Sources can be inserted by authenticated or service role"
  ON public.sources FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Claim sources are readable by everyone"
  ON public.claim_sources FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Claim sources can be inserted by authenticated or service role"
  ON public.claim_sources FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Agent events are readable by everyone"
  ON public.agent_events FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Agent events can be inserted by authenticated or service role"
  ON public.agent_events FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Editorial reviews are readable by everyone"
  ON public.editorial_reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Editorial reviews can be inserted by authenticated users or service role"
  ON public.editorial_reviews FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 13. Enable Supabase Realtime for live updates
-- Note: In Supabase SQL editor, this publishes table changes to subscribed WebSocket clients.
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.investigations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sources;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
