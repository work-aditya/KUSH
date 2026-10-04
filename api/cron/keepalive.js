/**
 * Vercel Serverless Function: Supabase Inactivity Keep-Alive Cron
 *
 * Runs approximately once per day to check if Supabase organic activity is stale.
 * If organic activity has occurred within the last 20 hours, it does nothing.
 * If stale, it performs a single lightweight update to public.system_heartbeat.
 */

export default async function handler(req, res) {
  // 1. Optional security verification via CRON_SECRET
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid CRON_SECRET' });
  }

  // 2. Resolve environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Missing Supabase configuration (SUPABASE_URL or API key)',
    });
  }

  try {
    // 3. Invoke PostgreSQL RPC record_fallback_heartbeat with 20h threshold
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/record_fallback_heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ stale_threshold_hours: 20 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        ok: false,
        error: `Supabase RPC returned HTTP ${response.status}`,
        details: errText,
      });
    }

    const result = await response.json();

    return res.status(200).json({
      ok: true,
      invoked_at: new Date().toISOString(),
      action: result?.action || 'completed',
      result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Unexpected keepalive error',
    });
  }
}
