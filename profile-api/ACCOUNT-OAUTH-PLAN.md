# KOR1816 Kingshot account-linking plan

## Goal

Build a consent-based account connection similar in user experience to the K710 Hub dashboard the user provided: the player signs in with a supported Kingshot account provider, approves read-only access, and KOR1816 displays their profile and the fields the provider actually returns.

## Preferred path to validate

Kingshot Alliance Command documents an OAuth 2.1 account endpoint:

- Developer guide: https://www.kingshotcommand.com/developers
- Public MCP endpoint: https://api.kingshotcommand.com/mcp
- Account MCP endpoint: https://api.kingshotcommand.com/mcp/account
- Protected-resource discovery: https://api.kingshotcommand.com/.well-known/oauth-protected-resource/mcp/account
- Authorization-server discovery: https://api.kingshotcommand.com/.well-known/oauth-authorization-server

Its developer guide describes OAuth 2.1 Authorization Code + PKCE (S256), dynamic client registration (RFC 7591), and a user consent page. The account endpoint documents read-only tools including `get_my_profile`, which may return Town Center level, power, troops, combat stats, and heroes. Actual fields and response shape must be confirmed using a real, consenting test account.

This is a third-party, independent fan-made service, not Kingshot's publisher. Availability, terms, data coverage, and consent experience must be tested before relying on it.

## Secure architecture

1. Keep the current landing gateway and profile page on the feature branch only.
2. Run OAuth discovery, dynamic client registration, state validation, PKCE S256, callback handling, and token exchange in a dedicated server-side Worker.
3. Keep access/refresh tokens server-side in an access-controlled store. Never place provider tokens in GitHub Pages JavaScript, query strings, local storage, or commits.
4. Before public release, bind the provider identity to the authenticated KOR1816 user. A game ID by itself is not proof of ownership.
5. Call the account MCP endpoint from the server and parse its documented Streamable HTTP / JSON-RPC response. Use read-only tools and the least-privilege scopes supported by the provider.
6. Store any KOR1816 profile separately from existing event/castle/seating Firestore documents, with verified user ownership, source, and last-sync timestamp.
7. Add rate limiting, session expiry/revocation, CSRF protection, safe error handling, and a user-facing disconnect action before public release.
8. Prefer a same-site API hostname or reverse proxy for production. A GitHub Pages page and a `workers.dev` API are cross-site; browser third-party-cookie restrictions may prevent the session cookie from working reliably.

## Fields to map and verify

- Identity/profile: player ID, nickname, kingdom, alliance, avatar, power.
- Progression: Town Center level, heroes, combat stats.
- Troops: only if the account tool returns actual counts for the connected test account.
- Mystic Trial / rankings / governor gear / charms: test availability; do not assume the account endpoint returns these.
- K710's 30-day session behavior is a reference, not a value to copy without confirming provider token lifetime and refresh rules.

## Current implementation status (2026-10-20)

- `profile-preview.html` remains a front-end prototype. It has manual fields and a separate public-data lookup button; it does not yet call the account OAuth Worker.
- `profile-api/worker.js` is a separate MightPulse public-data lookup template, not account authentication and not proof of ownership.
- `profile-api/account-worker.js` is an **undeployed prototype** with OAuth discovery/client registration, state + PKCE setup, callback/token exchange, server-side session storage in KV, a profile endpoint, and logout. These routes have not been integration-tested against the live provider.
- `profile-api/ACCOUNT-WORKER-README.md` documents the prototype, required Cloudflare KV binding and environment variables, and deployment caveats.
- `profile-api/wrangler.toml.example` is a placeholder configuration example only. Replace placeholders locally; do not commit real deployment identifiers or secrets.
- Not implemented yet: verified binding to a KOR1816/Firebase user, Firestore profile persistence, a front-end connect/disconnect flow, field mapping from a real provider response, and end-to-end tests.
- No Worker has been deployed. No public preview URL is verified. The draft PR remains unmerged.
- The production site and legacy site have not been changed.

## Safe next steps

1. Review the Worker against the provider's current OAuth metadata and MCP response format.
2. Add the account connect/status/disconnect controls to the feature-branch profile UI, disabled or clearly marked until an API base URL is configured.
3. Test the OAuth callback, session cookie behavior, refresh, logout, and profile response in a non-production environment.
4. Only after successful tests, add explicit user ownership binding and a separate profile persistence path. Do not change event/castle/seating documents.
5. Keep the PR in draft until those checks pass.
