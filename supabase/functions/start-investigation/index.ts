// Follow Supabase Edge Function standards (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      post_text, 
      source_platform = "X / Twitter", 
      language = "en", 
      author, 
      handle,
      reach_estimate
    } = await req.json();

    if (!post_text || typeof post_text !== "string" || post_text.trim().length < 20 || post_text.trim().length > 12000) {
      return new Response(
        JSON.stringify({ error: "post_text must be a string between 20 and 12,000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY Edge Function secret.");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user_id if client is authenticated
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    // 1. Create Investigation Record in Supabase
    const { data: investigation, error: insertError } = await supabase
      .from("investigations")
      .insert({
        user_id: userId,
        post_text: post_text.trim(),
        source_platform,
        language,
        author: author || null,
        handle: handle || null,
        reach_estimate: reach_estimate || "Active Viral Spread",
        status: "in_progress",
        misinformation_risk: "MODERATE",
        executive_summary: "Investigation queued. Awaiting cognitive agent execution...",
      })
      .select()
      .single();

    if (insertError || !investigation) {
      throw new Error(`Failed to create investigation: ${insertError?.message}`);
    }

    // 2. Insert initial Plan event into agent_events
    await supabase.from("agent_events").insert({
      investigation_id: investigation.id,
      phase: "PLAN",
      title: "Claim Decomposition & n8n Agent Invocation",
      detail: `Initialized investigation record ${investigation.id}. Dispatched payload to n8n cognitive agent workflow across ${source_platform}.`,
      search_queries: [`initial query: ${post_text.slice(0, 60)}`],
      status: "completed",
    });

    // 3. Dispatch to n8n Webhook with 10s Timeout Protection
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    const n8nWebhookToken = Deno.env.get("N8N_WEBHOOK_TOKEN");
    const callbackSecret = Deno.env.get("N8N_CALLBACK_SECRET");
    if (!callbackSecret) {
      throw new Error("N8N_CALLBACK_SECRET is not configured. Refusing to send an insecure callback token.");
    }

    let n8nTriggered = false;
    let n8nError: string | null = null;

    if (n8nWebhookUrl) {
      try {
        const n8nPayload = {
          // The uploaded n8n workflow validates the input field named `post`.
          // Keep post_text as metadata for the Supabase callback contract.
          post: investigation.post_text,
          investigation_id: investigation.id,
          post_text: investigation.post_text,
          source_platform: investigation.source_platform,
          language: investigation.language,
          author: investigation.author,
          handle: investigation.handle,
          callback_url: `${supabaseUrl}/functions/v1/n8n-webhook-callback`,
          agent_event_url: `${supabaseUrl}/functions/v1/n8n-agent-event`,
          callback_token: callbackSecret,
          timestamp: new Date().toISOString(),
        };

        const controller = new AbortController();
        // n8n must acknowledge quickly (see the setup notes delivered with this patch).
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(n8nWebhookToken ? { Authorization: `Bearer ${n8nWebhookToken}` } : {}),
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        n8nTriggered = n8nResponse.ok;
        if (!n8nResponse.ok) {
          n8nError = `n8n responded with status ${n8nResponse.status}: ${n8nResponse.statusText}`;
        }
      } catch (err: any) {
        console.error("Failed to notify n8n webhook:", err);
        n8nError = err.name === 'AbortError'
          ? 'n8n did not acknowledge the webhook within 15 seconds. Confirm the workflow responds immediately after accepting the request.'
          : (err?.message || 'Connection error');
      }
    } else {
      console.log("N8N_WEBHOOK_URL is not set; investigation queued for polling or manual worker.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        investigation_id: investigation.id,
        data: investigation,
        n8n_triggered: n8nTriggered,
        n8n_error: n8nError,
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
