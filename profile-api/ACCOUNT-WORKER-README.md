# Consent-based account Worker (prototype)

This is a separate prototype from `worker.js`, which only looks up public player data through MightPulse. It uses the documented OAuth 2.1 + PKCE account endpoint from Kingshot Alliance Command, an independent third-party fan project.

Provider documentation: https://www.kingshotcommand.com/developers

## What it does

- Dynamically discovers the provider OAuth endpoints and registers a public client.
- Starts authorization-code login with PKCE S256 and `openid offline_access` scopes.
- Exchanges the code server-side and stores access/refresh tokens in Cloudflare KV, never in the static page.
- Exposes a read-only `/api/profile` endpoint that calls `get_my_profile` using the provider's documented stateless JSON-RPC endpoint.
- Provides `/auth/logout` to delete the server-side session.
- The profile preview has test controls for connect, fetch, disconnect, and best-effort mapping of returned scalar fields and collections into the preview form.

## Not production-ready

**Do not deploy this publicly yet.** This is an implementation prototype, not a verified integration. The OAuth provider's live discovery, dynamic client registration, callback/token exchange, MCP response shape, refresh flow, and profile field names have not been integration-tested. Review the code and provider terms first.

## Deployment setup (manual GitHub Actions workflow)

A manual workflow is included at `.github/workflows/deploy-account-worker.yml`. It deploys **only this Worker**, never the GitHub Pages site. It does not run automatically on commits.

1. In Cloudflare, create a KV namespace for the account link session store and copy its namespace ID.
2. Create a scoped Cloudflare API token with permission to edit Workers and access the target account's KV namespace.
3. In GitHub repository Settings, add these **Actions secrets**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_KV_NAMESPACE_ID`
4. Add these **Actions repository variables**:
   - `ACCOUNT_WORKER_APP_ORIGIN` = `https://kor1816.github.io` (origin only; no path)
   - `ACCOUNT_WORKER_REDIRECT_URI` = the exact Worker callback URL ending in `/auth/callback`, for example `https://YOUR-WORKER-HOST/auth/callback`
5. In Actions, select **Deploy KOR1816 account Worker**, choose the feature branch `feature/landing-gateway-preview-2026-10-20`, and run the workflow manually.
6. After a successful deploy, open `https://YOUR-WORKER-HOST/health` and confirm it returns `mode: oauth-prototype-not-production`.
7. Open the profile preview on that same feature branch, paste the Worker base URL into **계정 연결 서버 주소**, then test connect, consent, fetch, and disconnect.

Do not put access tokens or refresh tokens in GitHub Pages, URL parameters, browser storage, or source control. This prototype does not require a static API key. Never paste Cloudflare secrets into a chat or commit them to the repository.

## Browser cookie limitation

The Worker sets an HttpOnly, Secure, SameSite=None cookie because GitHub Pages and `workers.dev` are cross-site. Some browsers block third-party cookies, so this setup may not retain a session from GitHub Pages. For reliable use, put the Worker behind a custom API domain that is same-site with the website, or proxy the UI and API through one same-site origin. Do not try to work around this by exposing tokens to JavaScript.

## Routes

- `GET /health`: basic worker status.
- `GET /auth/login`: start OAuth consent flow.
- `GET /auth/callback`: OAuth callback.
- `GET /api/profile`: read connected user's profile.
- `POST /auth/logout`: delete the server-side session.

## Safety / data behavior

- The provider is an independent fan-made service and is not affiliated with the Kingshot publisher.
- Profile access is read-only and requires explicit user consent.
- The current Worker does not bind the provider identity to a KOR1816/Firebase account. Do not treat a provider session as authorization to edit 1816 event data.
- No profile is saved to Firestore by this Worker. It only returns data to the browser.
- Add CSRF review, rate limiting, structured redacted logs, monitoring, and account deletion/revocation behavior before launch.
- The existing production site, legacy site, and current event/castle/seating documents remain untouched.