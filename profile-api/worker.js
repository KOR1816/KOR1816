/**
 * KOR1816 MightPulse profile proxy.
 *
 * Deploy as a separate Cloudflare Worker; do NOT put the MightPulse API key
 * in GitHub Pages JavaScript or any public repository file.
 *
 * Required Worker secret: MIGHTPULSE_API_KEY
 * Optional variable: ALLOWED_ORIGIN (defaults to https://kor1816.github.io)
 */
const DEFAULT_ORIGIN = "https://kor1816.github.io";

function json(data, status = 200, origin = DEFAULT_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const configuredOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
    const requestOrigin = request.headers.get("Origin");
    const originAllowed = !requestOrigin || requestOrigin === configuredOrigin;

    if (!originAllowed) {
      return new Response("Forbidden origin", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": configuredOrigin,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin",
        },
      });
    }

    if (request.method !== "GET") {
      return json({ ok: false, error: "method_not_allowed" }, 405, configuredOrigin);
    }

    if (url.pathname === "/health") {
      return json({ ok: true, service: "kor1816-profile-proxy" }, 200, configuredOrigin);
    }

    if (url.pathname !== "/api/profile") {
      return json({ ok: false, error: "not_found" }, 404, configuredOrigin);
    }

    if (!env.MIGHTPULSE_API_KEY) {
      return json({ ok: false, error: "server_not_configured" }, 503, configuredOrigin);
    }

    const id = (url.searchParams.get("id") || "").trim();
    if (!/^\d{4,20}$/.test(id)) {
      return json({ ok: false, error: "invalid_player_id" }, 400, configuredOrigin);
    }

    // Cache successful upstream data briefly to reduce API usage.
    const cacheKey = new Request(
      new URL(`/cached-profile/${encodeURIComponent(id)}`, url.origin).toString(),
      { method: "GET" }
    );
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("Access-Control-Allow-Origin", configuredOrigin);
      headers.set("Vary", "Origin");
      return new Response(cached.body, { status: cached.status, headers });
    }

    const upstreamUrl = new URL(
      `https://api.mightpulse.com/v1/players/${encodeURIComponent(id)}`
    );
    upstreamUrl.searchParams.set("include", "base,heroes,ranks,gov_gear");

    let upstream;
    try {
      upstream = await fetch(upstreamUrl, {
        headers: { Authorization: `Bearer ${env.MIGHTPULSE_API_KEY}` },
      });
    } catch {
      return json({ ok: false, error: "upstream_unavailable" }, 502, configuredOrigin);
    }

    let payload;
    try {
      payload = await upstream.json();
    } catch {
      return json({ ok: false, error: "invalid_upstream_response" }, 502, configuredOrigin);
    }

    if (!upstream.ok || payload?.ok === false) {
      const status = upstream.status === 404 ? 404 : 502;
      return json({
        ok: false,
        error: upstream.status === 404 ? "player_not_found" : "upstream_request_failed",
      }, status, configuredOrigin);
    }

    const result = {
      ok: true,
      player: payload.player || null,
      heroes: Array.isArray(payload.heroes) ? payload.heroes : [],
      ranks: payload.ranks || null,
      gov_gear: payload.gov_gear || null,
      fresh: payload.fresh ?? null,
      age_seconds: payload.age_seconds ?? null,
    };

    const response = new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300",
        "Access-Control-Allow-Origin": configuredOrigin,
        "Vary": "Origin",
        "X-Content-Type-Options": "nosniff",
      },
    });

    // Caching is an optimization only; API keys are never returned.
    await cache.put(cacheKey, response.clone());
    return response;
  },
};
