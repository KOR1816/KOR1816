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
7. Only after this succeeds, configure the front end to call the Worker URL. Do not expose this endpoint to the public without rate limits and a policy decision.

## Important limitations
- A game ID is not proof of account ownership.
- API fields can be absent, hidden, stale, or provider-dependent.
- Troop counts are not guaranteed by this endpoint's documented response.
- This Worker only fetches public provider data. It does not save player profiles or authenticate KOR1816 users.
- It does not modify the existing Firestore `siteData` documents.
- A static GitHub Pages frontend cannot keep a provider API key secret; a server-side proxy is required.
- This code is a template and has not been deployed or integration-tested. It must not be described as live until deployed and verified.
