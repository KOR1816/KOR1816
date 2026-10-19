/**
 * KOR1816 account-linking Worker prototype.
 *
 * Uses the independent Kingshot Alliance Command OAuth 2.1 account endpoint.
 * Required Cloudflare binding: KV namespace OAUTH_STORE.
 * Required vars: APP_ORIGIN, OAUTH_REDIRECT_URI.
 * Deploy only after reviewing the README and provider terms.
 */
const RESOURCE = "https://api.kingshotcommand.com/mcp/account";
const RESOURCE_META = "https://api.kingshotcommand.com/.well-known/oauth-protected-resource/mcp/account";
const AUTH_META = "https://api.kingshotcommand.com/.well-known/oauth-authorization-server";
const COOKIE = "__Host-kor1816_session";
const STATE_TTL = 600;
const SESSION_TTL = 60 * 60 * 24 * 30;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
function randomHex(bytes = 32) {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return [...a].map(v => v.toString(16).padStart(2, "0")).join("");
}
function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function sha256b64url(value) {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
function cookieHeader(value, maxAge = SESSION_TTL) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${maxAge}`;
}
function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const item = raw.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return item ? item.slice(name.length + 1) : "";
}
function cors(request, env, headers = {}) {
  const origin = request.headers.get("Origin");
  const allowed = origin && origin === env.APP_ORIGIN;
  const out = { "Vary": "Origin", ...headers };
  if (allowed) {
    out["Access-Control-Allow-Origin"] = origin;
    out["Access-Control-Allow-Credentials"] = "true";
    out["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    out["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return out;
}
async function discover() {
  const [authRes, resourceRes] = await Promise.all([
    fetch(AUTH_META, { headers: { Accept: "application/json" } }),
    fetch(RESOURCE_META, { headers: { Accept: "application/json" } })
  ]);
  if (!authRes.ok || !resourceRes.ok) throw new Error("oauth_discovery_failed");
  const auth = await authRes.json();
  const resource = await resourceRes.json();
  if (!auth.authorization_endpoint || !auth.token_endpoint || !auth.registration_endpoint) {
    throw new Error("oauth_metadata_incomplete");
  }
  return { auth, resource };
}
async function registerClient(env, auth) {
  const cached = await env.OAUTH_STORE.get("oauth:client");
  if (cached) return JSON.parse(cached);
  const response = await fetch(auth.registration_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_name: "KOR1816 Player Profile",
      application_type: "web",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      redirect_uris: [env.OAUTH_REDIRECT_URI],
      token_endpoint_auth_method: "none"
    })
  });
  if (!response.ok) throw new Error("oauth_client_registration_failed");
  const client = await response.json();
  if (!client.client_id) throw new Error("oauth_client_id_missing");
  await env.OAUTH_STORE.put("oauth:client", JSON.stringify(client));
  return client;
}
async function login(request, env) {
  if (!env.OAUTH_STORE || !env.APP_ORIGIN || !env.OAUTH_REDIRECT_URI) {
    return json({ ok: false, error: "worker_not_configured" }, 503);
  }
  const { auth } = await discover();
  const client = await registerClient(env, auth);
  const state = randomHex(24);
  const verifier = randomHex(32);
  const challenge = await sha256b64url(verifier);
  await env.OAUTH_STORE.put("oauth:state:" + state, JSON.stringify({
    verifier, createdAt: Date.now(), redirectUri: env.OAUTH_REDIRECT_URI, clientId: client.client_id
  }), { expirationTtl: STATE_TTL });
  const url = new URL(auth.authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", client.client_id);
  url.searchParams.set("redirect_uri", env.OAUTH_REDIRECT_URI);
  url.searchParams.set("scope", "openid offline_access");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return Response.redirect(url.toString(), 302);
}
async function callback(request, env) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return Response.redirect(env.APP_ORIGIN + "/KOR1816/profile-preview.html?auth=denied", 302);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return json({ ok: false, error: "oauth_callback_missing_parameters" }, 400);
  const stored = await env.OAUTH_STORE.get("oauth:state:" + state);
  if (!stored) return json({ ok: false, error: "oauth_state_expired_or_invalid" }, 400);
  await env.OAUTH_STORE.delete("oauth:state:" + state);
  const transaction = JSON.parse(stored);
  if (Date.now() - transaction.createdAt > STATE_TTL * 1000) return json({ ok: false, error: "oauth_state_expired" }, 400);
  const { auth } = await discover();
  const tokenResponse = await fetch(auth.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: transaction.clientId,
      redirect_uri: transaction.redirectUri,
      code_verifier: transaction.verifier
    })
  });
  if (!tokenResponse.ok) return json({ ok: false, error: "oauth_token_exchange_failed" }, 502);
  const token = await tokenResponse.json();
  if (!token.access_token) return json({ ok: false, error: "oauth_access_token_missing" }, 502);
  const sessionId = randomHex(32);
  await env.OAUTH_STORE.put("session:" + sessionId, JSON.stringify({
    accessToken: token.access_token,
    refreshToken: token.refresh_token || null,
    expiresAt: Date.now() + Math.max(60, Number(token.expires_in || 3600)) * 1000,
    clientId: transaction.clientId,
    scope: token.scope || "openid"
  }), { expirationTtl: SESSION_TTL });
  return new Response(null, {
    status: 302,
    headers: {
      Location: env.APP_ORIGIN + "/KOR1816/profile-preview.html?auth=connected",
      "Set-Cookie": cookieHeader(sessionId),
      "Cache-Control": "no-store"
    }
  });
}
async function getSession(env, sessionId, auth) {
  const raw = await env.OAUTH_STORE.get("session:" + sessionId);
  if (!raw) return null;
  const session = JSON.parse(raw);
  if (session.expiresAt > Date.now() + 30000) return session;
  if (!session.refreshToken) return null;
  const refreshed = await fetch(auth.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
      client_id: session.clientId
    })
  });
  if (!refreshed.ok) {
    await env.OAUTH_STORE.delete("session:" + sessionId);
    return null;
  }
  const next = await refreshed.json();
  if (!next.access_token) return null;
  session.accessToken = next.access_token;
  if (next.refresh_token) session.refreshToken = next.refresh_token;
  session.expiresAt = Date.now() + Math.max(60, Number(next.expires_in || 3600)) * 1000;
  await env.OAUTH_STORE.put("session:" + sessionId, JSON.stringify(session), { expirationTtl: SESSION_TTL });
  return session;
}
async function mcpCall(accessToken, name) {
  const headers = {
    "Authorization": "Bearer " + accessToken,
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
  };
  const init = await fetch(RESOURCE, {
    method: "POST", headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "KOR1816", version: "0.1.0" }
    } })
  });
  if (init.status === 401) throw new Error("provider_unauthorized");
  if (!init.ok) throw new Error("mcp_initialize_failed");
  const call = await fetch(RESOURCE, {
    method: "POST", headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: {} } })
  });
  if (call.status === 401) throw new Error("provider_unauthorized");
  if (call.status === 429) throw new Error("provider_rate_limited");
  if (!call.ok) throw new Error("mcp_tool_call_failed");
  const payload = await call.json();
  if (payload.error) throw new Error("mcp_tool_error");
  const contents = payload.result && payload.result.content;
  if (Array.isArray(contents)) {
    for (const item of contents) {
      if (item && typeof item.text === "string") {
        try { return JSON.parse(item.text); } catch {}
      }
    }
  }
  return payload.result || payload;
}
async function profile(request, env) {
  const sessionId = getCookie(request, COOKIE);
  if (!sessionId) return json({ ok: false, error: "not_connected" }, 401, cors(request, env));
  try {
    const { auth } = await discover();
    const session = await getSession(env, sessionId, auth);
    if (!session) return json({ ok: false, error: "session_expired" }, 401, cors(request, env));
    const data = await mcpCall(session.accessToken, "get_my_profile");
    return json({ ok: true, source: "Kingshot Alliance Command (account consent)", fetchedAt: new Date().toISOString(), data }, 200, cors(request, env));
  } catch (e) {
    const error = String(e && e.message || "");
    const status = error === "provider_rate_limited" ? 429 : 502;
    return json({ ok: false, error: error || "profile_lookup_failed" }, status, cors(request, env));
  }
}
async function logout(request, env) {
  const sessionId = getCookie(request, COOKIE);
  if (sessionId) await env.OAUTH_STORE.delete("session:" + sessionId);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: cors(request, env, {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": cookieHeader("", 0),
      "Cache-Control": "no-store"
    })
  });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request, env) });
    if (url.pathname === "/auth/login" && request.method === "GET") {
      try { return await login(request, env); }
      catch { return json({ ok: false, error: "oauth_setup_failed" }, 502); }
    }
    if (url.pathname === "/auth/callback" && request.method === "GET") {
      try { return await callback(request, env); }
      catch { return json({ ok: false, error: "oauth_callback_failed" }, 502); }
    }
    if (url.pathname === "/api/profile" && request.method === "GET") return profile(request, env);
    if (url.pathname === "/auth/logout" && request.method === "POST") return logout(request, env);
    if (url.pathname === "/health" && request.method === "GET") return json({ ok: true, mode: "oauth-prototype-not-production" });
    return json({ ok: false, error: "not_found" }, 404);
  }
};
