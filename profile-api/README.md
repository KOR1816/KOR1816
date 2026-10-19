# KOR1816 MightPulse API proxy (separate backend)

This folder contains a Cloudflare Worker for server-side MightPulse requests.
It is intentionally separate from the existing GitHub Pages application.

## Security rules

- Never put the MightPulse key in `index.html`, `app.js`, other public files, or GitHub Pages secrets intended for browser code.
- Add the key as a **Cloudflare Worker secret** named `MIGHTPULSE_API_KEY`.
- The endpoint returns public player data; an ID lookup is **not proof of account ownership**.
- Before exposing the endpoint to a wider audience, add a Cloudflare rate-limiting rule for this Worker route to protect the 5,000-request daily quota.
- The CORS allowlist helps browser behavior but is not authentication and does not stop command-line clients.
- Do not use the Worker to modify any KOR1816 registration, roster, or castle-layout data.

## Deploy (manual; does not change the current site)

1. In Cloudflare, create a **Worker** named `kor1816-profile-api`.
2. Paste the contents of `worker.js` into the Worker editor and deploy it.
3. In Worker **Settings → Variables and Secrets**, add secret `MIGHTPULSE_API_KEY` with the current MightPulse key. Never paste it into GitHub or chat.
4. Optionally set the variable `ALLOWED_ORIGIN` to `https://kor1816.github.io`.
5. Add a Cloudflare rate-limiting rule for the Worker endpoint before sharing it publicly.
6. Test `/health`; it should return `{"ok":true,"service":"kor1816-profile-proxy"}`.
7. Test `/api/profile?id=101021610`; it should return profile JSON without revealing the API key.

The Worker code currently allows only GET requests, validates numeric IDs, requests `base,heroes,ranks,gov_gear`, returns a limited response shape, and caches successful responses briefly. It does not yet modify the existing KOR1816 UI. Once the Worker is deployed and tested, a separate reviewed change can connect the profile preview to its URL.
