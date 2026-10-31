VERITAS AI — STAGE 1 PATCH
==========================

Purpose
-------
Connect the main website claim submission to the existing Supabase Edge Function
`start-investigation`, which dispatches the claim to the existing n8n workflow.

Files changed
-------------
1. src/App.tsx
   - Replaces POST /api/investigate with supabase.functions.invoke('start-investigation').
   - Displays an honest queued/analyzing report rather than a fabricated completed verdict.
   - Keeps n8n credentials server-side.

2. supabase/functions/start-investigation/index.ts
   - Validates claim length (20–12,000 characters).
   - Sends BOTH `post` and `post_text` to n8n. The uploaded n8n workflow expects `post`.
   - Removes the insecure fallback callback secret.
   - Reports a dispatch timeout clearly.

IMPORTANT: n8n acknowledgement change required
----------------------------------------------
The uploaded n8n workflow uses `responseMode: responseNode` and its Respond to
Webhook node is at the end of the workflow, after the investigation/review path.
The Edge Function waits only 15 seconds for the webhook acknowledgement.

Before testing, edit the existing n8n workflow:
1. Keep the existing webhook path `/webhook/veritas-factcheck`.
2. Keep the webhook authentication configured.
3. Add/move a Respond to Webhook node immediately after request validation and
   duplicate/idempotency handling, before long-running Gemini/search/review steps.
4. Return HTTP 202 with JSON such as:
   {"accepted": true, "investigation_id": "={{$json.investigation_id}}"}
5. Ensure the rest of the workflow continues after that response node.
6. Remove or reconfigure the old end-of-workflow response node so the workflow
   does not attempt to send a second response.
7. Confirm the webhook node is configured to use the Respond to Webhook node.

The exact expression for investigation_id may need adjustment to the item shape
at that point in your n8n workflow. Do not paste secrets into the workflow JSON
or frontend code.

Supabase Edge Function secrets
------------------------------
Verify these exist in the VERITAS Supabase project:
- N8N_WEBHOOK_URL = the production webhook URL for `/webhook/veritas-factcheck`
- N8N_WEBHOOK_TOKEN = the same bearer token expected by n8n (if webhook auth uses it)
- N8N_CALLBACK_SECRET = a long random secret shared only by n8n and Edge Functions
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-side Edge Function secret only)

Deploy the function from Supabase Dashboard > Edge Functions > start-investigation,
or via your established deployment workflow. Do not put SUPABASE_SERVICE_ROLE_KEY,
N8N_WEBHOOK_TOKEN, N8N_CALLBACK_SECRET, callback URLs, or n8n resume URLs in VITE_*
variables or browser code.

Test sequence
-------------
1. Deploy the updated start-investigation Edge Function.
2. Activate the n8n workflow.
3. Submit a claim of at least 20 characters from the website.
4. Check Supabase `investigations` for a new row and copy its id.
5. Check n8n Executions for the matching investigation_id.
6. Confirm n8n agent events appear in `agent_events`.
7. Confirm the callback writes claims/sources and updates the investigation.
8. Confirm the website shows the same investigation id and live progress.

Known limitation of this stage
------------------------------
This patch only connects submission and corrects the n8n input contract. It does
NOT yet secure the public RLS policies, editor approval endpoints, callback
authorization, report refresh fallback, or the complete n8n human-review return
path. Do not treat it as production-ready until those are audited and fixed.
