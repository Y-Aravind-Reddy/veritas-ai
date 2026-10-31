
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedDecisions = ["APPROVED", "REJECTED", "MODIFIED"];
const allowedVerdicts = [
  "TRUE",
  "MOSTLY_TRUE",
  "MIXED",
  "MISLEADING",
  "FALSE",
  "UNVERIFIABLE",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // 1. Require a real Supabase access token.
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const accessToken = authHeader.substring(7);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const publicKey =
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !serviceKey || !publicKey) {
      throw new Error("Required Supabase Edge Function secrets are missing.");
    }

    // 2. Verify the caller's identity using the public key.
    const authClient = createClient(supabaseUrl, publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } =
      await authClient.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired access token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const user = authData.user;

    // 3. Create privileged client only after identity verification.
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 4. Check the caller's actual database role.
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!["admin", "editor"].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Only editors and admins can review reports" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 5. Validate the submitted review.
    const body = await req.json();

    const {
      investigation_id,
      decision,
      decision_notes = "",
      claim_reviews = [],
    } = body;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof investigation_id !== "string" ||
      !uuidPattern.test(investigation_id)
    ) {
      return new Response(
        JSON.stringify({ error: "A valid investigation_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!allowedDecisions.includes(decision)) {
      return new Response(
        JSON.stringify({
          error: "Decision must be APPROVED, REJECTED or MODIFIED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (
      typeof decision_notes !== "string" ||
      decision_notes.length > 5000
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid decision notes" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!Array.isArray(claim_reviews) || claim_reviews.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid claim_reviews array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 6. Confirm that the investigation exists.
    const { data: investigation, error: investigationError } =
      await adminClient
        .from("investigations")
        .select("id, status")
        .eq("id", investigation_id)
        .single();

    if (investigationError || !investigation) {
      return new Response(
        JSON.stringify({ error: "Investigation not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 7. Validate every claim override and ensure it belongs to this report.
    for (const review of claim_reviews) {
      if (
        !review ||
        typeof review.claimId !== "string" ||
        !uuidPattern.test(review.claimId) ||
        !allowedVerdicts.includes(review.overrideVerdict)
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid claim review or verdict" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const { data: claim, error: claimError } = await adminClient
        .from("claims")
        .select("id")
        .eq("id", review.claimId)
        .eq("investigation_id", investigation_id)
        .maybeSingle();

      if (claimError || !claim) {
        return new Response(
          JSON.stringify({
            error: "A reviewed claim does not belong to this investigation",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // 8. Apply claim-level overrides and check every database result.
    for (const review of claim_reviews) {
      const { error: updateClaimError } = await adminClient
        .from("claims")
        .update({ verdict: review.overrideVerdict })
        .eq("id", review.claimId)
        .eq("investigation_id", investigation_id);

      if (updateClaimError) {
        throw new Error(
          `Failed to update claim: ${updateClaimError.message}`,
        );
      }
    }

    // 9. Save the review using the authenticated user's identity.
    const reviewerName =
      profile.full_name || profile.email || user.email || "Verified Editor";

    const { data: review, error: reviewError } = await adminClient
      .from("editorial_reviews")
      .insert({
        investigation_id,
        reviewer_id: user.id,
        reviewer_name: reviewerName,
        decision,
        decision_notes,
        claim_reviews,
      })
      .select()
      .single();

    if (reviewError) {
      throw new Error(
        `Failed to save editorial review: ${reviewError.message}`,
      );
    }

    // 10. Update the investigation status.
    const newStatus =
      decision === "REJECTED" ? "rejected" : "approved";

    const { error: statusError } = await adminClient
      .from("investigations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", investigation_id);

    if (statusError) {
      throw new Error(
        `Review saved, but investigation status update failed: ${statusError.message}`,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Authenticated editorial review recorded",
        investigation_id,
        reviewer: reviewerName,
        decision,
        status: newStatus,
        review,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Editorial review error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error
          ? error.message
          : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
