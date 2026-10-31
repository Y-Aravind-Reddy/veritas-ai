// Follow Supabase Edge Function standards (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-n8n-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const configuredSecret = Deno.env.get("N8N_CALLBACK_SECRET") || "veritas-secret";
    const authHeader = req.headers.get("authorization") || "";
    const customHeader = req.headers.get("x-n8n-secret") || "";

    const providedToken = authHeader.replace(/^Bearer\s+/i, "") || customHeader;
    if (configuredSecret && providedToken !== configuredSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Secret token mismatch." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      investigation_id, 
      phase = "PLAN", 
      title, 
      detail, 
      search_queries = [], 
      findings = [], 
      status = "completed" 
    } = await req.json();

    if (!investigation_id || !title || !detail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: investigation_id, title, and detail are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: event, error: insertError } = await supabase
      .from("agent_events")
      .insert({
        investigation_id,
        phase,
        title,
        detail,
        search_queries,
        findings,
        status,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to record agent event: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: event.id,
        message: "Cognitive step recorded and broadcast via Realtime",
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
