/**
 * KOR1816 profile lookup proxy for Cloudflare Workers.
 *
 * Required Worker secret: MIGHTPULSE_API_KEY
 * Required variable: ALLOWED_ORIGIN (exact GitHub Pages origin, e.g. https://kor1816.github.io)
 * Deploy as a separate Worker. Do not paste the API key into GitHub Pages files.
 */
const json = (data, status = 200, origin = "*") => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "cache-control": "no-store"
  }
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "";
    const corsOrigin = allowed && origin === allowed ? allowed : "null";
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": corsOrigin,
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "vary": "Origin"
        }
      });
    }
    if (allowed && origin && origin !== allowed) return json({ ok: false, error: "origin_not_allowed" }, 403, corsOrigin);
    if (request.method !== "GET") return json({ ok: false, error: "method_not_allowed" }, 405, corsOrigin);
    if (!env.MIGHTPULSE_API_KEY) return json({ ok: false, error: "server_api_key_not_configured" }, 503, corsOrigin);

    const url = new URL(request.url);
    if (url.pathname !== "/api/player") return json({ ok: false, error: "not_found" }, 404, corsOrigin);
    const id = (url.searchParams.get("id") || "").trim();
    if (!/^\d{5,20}$/.test(id)) return json({ ok: false, error: "invalid_player_id" }, 400, corsOrigin);

    const upstream = new URL("https://api.mightpulse.com/v1/players/" + encodeURIComponent(id));
    upstream.searchParams.set("include", "base,heroes,ranks,gov_gear");
    try {
      const response = await fetch(upstream.toString(), {
        headers: { "Authorization": "Bearer " + env.MIGHTPULSE_API_KEY, "Accept": "application/json" },
        signal: AbortSignal.timeout(25000)
      });
      const raw = await response.text();
      let payload;
      try { payload = JSON.parse(raw); } catch { payload = { ok: false, error: "invalid_upstream_response" }; }
      if (!response.ok) {
        const status = response.status === 404 ? 404 : response.status === 429 ? 429 : 502;
        return json({ ok: false, error: response.status === 404 ? "player_not_found" : response.status === 429 ? "provider_rate_limited" : "provider_request_failed", providerStatus: response.status }, status, corsOrigin);
      }
      if (!payload || payload.ok !== true || typeof payload.player !== "object") {
        return json({ ok: false, error: "unexpected_provider_schema" }, 502, corsOrigin);
      }
      return json({ ok: true, source: "MightPulse", fetchedAt: new Date().toISOString(), data: payload }, 200, corsOrigin);
    } catch {
      return json({ ok: false, error: "provider_timeout_or_network_error" }, 504, corsOrigin);
    }
  }
};
