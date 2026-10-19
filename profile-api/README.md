# KOR1816 profile lookup API setup (separate service)

This folder is a **starter template**, not a deployed service. It is deliberately separate from GitHub Pages and from the current Firestore event documents.

## What it does
- Accepts `GET /api/player?id=123456789`.
- Validates that the game ID contains 5–20 digits.
- Calls MightPulse `GET /v1/players/{id}?include=base,heroes,ranks,gov_gear` from a server-side Cloudflare Worker.
- Keeps the provider API key in the Worker secret store and never sends it to the browser.
- Restricts browser CORS to the configured GitHub Pages origin.
- Returns provider errors without exposing raw upstream response bodies.

## Before deploying
1. Create/confirm a MightPulse account and API key, and verify its current terms, quota, and data usage permissions.
2. Create a Cloudflare Worker in an account you control. Upload `worker.js`.
3. Add Worker secret `MIGHTPULSE_API_KEY` using the Cloudflare dashboard/CLI secret feature. Never commit the key.
4. Set Worker variable `ALLOWED_ORIGIN=https://kor1816.github.io`. This controls CORS only; it is not authentication or abuse protection.
5. Add request throttling and monitoring at the Worker/Cloudflare layer before public release.
6. Test a consenting sample player ID and confirm what fields actually return, including whether governor gear is hidden and whether hero data is present.
7. Only after this succeeds, configure the front end to call the Worker URL by setting `window.KOR1816_PROFILE_API_URL` to the Worker endpoint (for example, `https://YOUR-WORKER.workers.dev/api/player`) before the profile page script runs. Do not commit API keys to the frontend. Do not expose this endpoint to the public without rate limits and a policy decision.

## Important limitations
- A game ID is not proof of account ownership.
- API fields can be absent, hidden, stale, or provider-dependent.
- Troop counts are not guaranteed by this endpoint's documented response.
- This Worker only fetches public provider data. It does not save player profiles or authenticate KOR1816 users.
- It does not modify the existing Firestore `siteData` documents.
- A static GitHub Pages frontend cannot keep a provider API key secret; a server-side proxy is required.
- This code is a template and has not been deployed or integration-tested. It must not be described as live until deployed and verified.

## Account sign-in vs public ID lookup

The Worker above is only a **public player-data lookup** using a MightPulse API key. It does not sign the player in and must not be presented as proof that the visitor owns the entered player ID.

For a consent-based account connection closer to the K710 Hub flow, see [ACCOUNT-OAUTH-PLAN.md](./ACCOUNT-OAUTH-PLAN.md). Kingshot Alliance Command documents an OAuth 2.1 + PKCE account endpoint and a read-only `get_my_profile` tool that may return troops, combat stats, heroes, and Town Center level. That path needs a separate server-side OAuth implementation, token/session storage, user consent, and live validation; it is not implemented by this Worker.

The public lookup Worker now stops waiting after 25 seconds and rejects unexpected provider response shapes. This avoids waiting for the provider's full documented refresh window; a timeout should be shown as a retryable lookup failure, not as an empty profile.

Do not deploy this public endpoint without Cloudflare-side rate limiting and monitoring. CORS only limits normal browser access and is not authentication.
