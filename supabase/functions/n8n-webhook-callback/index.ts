// Follow Supabase Edge Function standards (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-n8n-secret, x-idempotency-key",
};

// Timing-safe constant time string comparison to prevent timing attacks
function timingSafeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const lenA = a.length;
  const lenB = b.length;
  let diff = lenA ^ lenB;
  const maxLen = Math.max(lenA, lenB);
  for (let i = 0; i < maxLen; i++) {
    const charA = i < lenA ? a.charCodeAt(i) : 0;
    const charB = i < lenB ? b.charCodeAt(i) : 0;
    diff |= charA ^ charB;
  }
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify Secret Callback Token (Timing-safe)
    const configuredSecret = Deno.env.get("N8N_CALLBACK_SECRET") || "veritas-n8n-callback-secret-key";
    const authHeader = req.headers.get("authorization") || "";
    const customHeader = req.headers.get("x-n8n-secret") || "";

    const providedToken = authHeader.replace(/^Bearer\s+/i, "") || customHeader;
    if (!timingSafeCompare(configuredSecret, providedToken)) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized callback. Secret token mismatch or missing credentials.",
          hint: "Provide Authorization: Bearer <N8N_CALLBACK_SECRET> or x-n8n-secret header."
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const { 
      investigation_id, 
      status = "completed", 
      overall_verdict = "MIXED_ACCURACY",
      credibility_score = 50,
      misinformation_risk = "MODERATE",
      executive_summary,
      claims = [],
      sources = [],
      metrics = {},
      error_message = null
    } = payload;

    if (!investigation_id) {
      return new Response(
        JSON.stringify({ error: "Missing required investigation_id in callback payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch existing investigation for Idempotency & Validation
    const { data: existingInvestigation, error: fetchError } = await supabase
      .from("investigations")
      .select("id, status, updated_at")
      .eq("id", investigation_id)
      .single();

    if (fetchError || !existingInvestigation) {
      return new Response(
        JSON.stringify({ error: `Investigation with ID ${investigation_id} not found.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency: If investigation was already marked review_pending or approved with same verdict, return cached response
    if (existingInvestigation.status === "review_pending" || existingInvestigation.status === "approved") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Idempotent response: investigation results already recorded.",
          investigation_id,
          status: existingInvestigation.status,
          idempotent: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Handle Failed Agent Execution from n8n
    if (status === "failed") {
      await supabase.from("investigations").update({
        status: "failed",
        executive_summary: error_message || "Investigation failed during automated n8n agent execution.",
        updated_at: new Date().toISOString(),
      }).eq("id", investigation_id);

      await supabase.from("agent_events").insert({
        investigation_id,
        phase: "REPLAN",
        title: "n8n Agent Workflow Execution Failed",
        detail: error_message || "Upstream execution encountered an error.",
        status: "failed",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Investigation marked as failed as reported by n8n.",
          investigation_id,
          status: "failed",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Clean prior partial claims and sources to prevent duplicate accumulation on retry
    await supabase.from("claims").delete().eq("investigation_id", investigation_id);
    await supabase.from("sources").delete().eq("investigation_id", investigation_id);

    // 5. Insert Sources & get generated IDs
    const sourceRecords = sources.map((s: any) => ({
      investigation_id,
      title: s.title || s.domain || "Source Reference",
      url: s.url || "#",
      domain: s.domain || (s.url ? new URL(s.url).hostname.replace(/^www\./, '') : "web"),
      publisher: s.publisher || s.domain || "Web",
      reliability_tier: s.reliability_tier || "COMMUNITY",
      snippet: s.snippet || null,
    }));

    let insertedSources: any[] = [];
    if (sourceRecords.length > 0) {
      const { data, error: srcError } = await supabase
        .from("sources")
        .insert(sourceRecords)
        .select("id, url");
      if (srcError) {
        console.error("Error inserting sources:", srcError);
      } else {
        insertedSources = data || [];
      }
    }

    // 6. Insert Claims & get generated IDs
    const claimRecords = claims.map((c: any, idx: number) => ({
      investigation_id,
      statement: c.statement,
      quote_snippet: c.quote_snippet || null,
      category: c.category || "event",
      verdict: c.verdict || "MIXED",
      confidence: typeof c.confidence === "number" ? Math.min(100, Math.max(0, c.confidence)) : 80,
      explanation: c.explanation || "Analyzed against authoritative sources.",
      evidence_summary: c.evidence_summary || null,
      counter_evidence: c.counter_evidence || null,
      decontextualization_factor: c.decontextualization_factor || null,
      order_index: idx,
    }));

    let insertedClaims: any[] = [];
    if (claimRecords.length > 0) {
      const { data, error: claimError } = await supabase
        .from("claims")
        .insert(claimRecords)
        .select("id, order_index");
      if (claimError) {
        console.error("Error inserting claims:", claimError);
      } else {
        insertedClaims = data || [];
      }
    }

    // 7. Explicitly Link claim_sources Join Table
    if (insertedClaims.length > 0 && insertedSources.length > 0) {
      const sourceUrlToId = new Map(insertedSources.map((s) => [s.url?.toLowerCase(), s.id]));
      const claimSourceLinks: Array<{ claim_id: string; source_id: string }> = [];

      for (let i = 0; i < claims.length; i++) {
        const originalClaim = claims[i];
        const claimId = insertedClaims[i]?.id;
        if (!claimId) continue;

        // Check if specific source URLs are declared for this claim
        const claimSpecificUrls = originalClaim.source_urls || 
          (originalClaim.sources ? originalClaim.sources.map((s: any) => s.url) : []);

        if (Array.isArray(claimSpecificUrls) && claimSpecificUrls.length > 0) {
          for (const url of claimSpecificUrls) {
            const matchedSourceId = sourceUrlToId.get(url?.toLowerCase());
            if (matchedSourceId) {
              claimSourceLinks.push({ claim_id: claimId, source_id: matchedSourceId });
            }
          }
        } else {
          // If claim does not specify specific URLs, link primary sources
          for (const src of insertedSources) {
            claimSourceLinks.push({ claim_id: claimId, source_id: src.id });
          }
        }
      }

      if (claimSourceLinks.length > 0) {
        // Deduplicate links
        const uniqueLinks = Array.from(
          new Map(claimSourceLinks.map((l) => [`${l.claim_id}_${l.source_id}`, l])).values()
        );
        const { error: linkError } = await supabase
          .from("claim_sources")
          .upsert(uniqueLinks, { onConflict: "claim_id,source_id" });
        if (linkError) {
          console.warn("Warning inserting claim_sources:", linkError);
        }
      }
    }

    // 8. Insert Final Synthesis Agent Event
    await supabase.from("agent_events").insert({
      investigation_id,
      phase: "SYNTHESIZE",
      title: "n8n Agent Workflow Completed & Verified",
      detail: `Synthesized ${claims.length} claim verdicts across ${sources.length} sources. Assigned credibility score ${credibility_score}/100 and risk tier ${misinformation_risk}.`,
      findings: [`Report updated with final consensus verdict: ${overall_verdict}`],
      status: "completed",
    });

    // 9. Update Investigation Record
    const nextStatus = status === "completed" ? "review_pending" : status;
    const { data: updatedInvestigation, error: updateError } = await supabase
      .from("investigations")
      .update({
        status: nextStatus,
        overall_verdict,
        credibility_score: Math.min(100, Math.max(0, credibility_score)),
        misinformation_risk,
        executive_summary: executive_summary || "Investigation completed by automated cognitive fact-checking agent.",
        metrics: {
          durationMs: metrics.durationMs || 3500,
          searchesExecuted: metrics.searchesExecuted || sources.length * 2,
          sourcesConsulted: sources.length,
          claimsCount: claims.length,
          loopCycles: metrics.loopCycles || 2,
        },
        raw_n8n_payload: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", investigation_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update investigation: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Investigation results, claims, sources, and claim_sources links successfully stored.",
        investigation_id,
        status: updatedInvestigation.status,
        claims_count: insertedClaims.length,
        sources_count: insertedSources.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
