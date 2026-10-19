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

Its developer guide says account access uses OAuth 2.1 Authorization Code + PKCE (S256), dynamic client registration (RFC 7591), and a user consent page. The account endpoint exposes read-only tools including `get_my_profile`, documented to include Town Center level, power, troops, combat stats, and heroes. This is a more promising route for actual account-owned troop/profile data than looking up a public numeric ID alone.

This is a third-party, independent fan-made service, not Kingshot's publisher. Its availability, terms, data coverage, and consent experience must be tested before relying on it.

## Secure architecture

1. Keep the current landing gateway and profile page on the feature branch only.
2. Implement OAuth discovery, dynamic client registration, state/nonce validation, PKCE S256, callback handling, and token exchange in a dedicated server-side Worker.
3. Keep access/refresh tokens server-side in an encrypted or access-controlled store. Do not place provider tokens in GitHub Pages JavaScript, query strings, local storage, or commits.
4. Bind the resulting provider identity to the authenticated KOR1816 user. A game ID by itself is not proof of ownership.
5. Call the account MCP endpoint from the server and parse the documented Streamable HTTP / JSON-RPC response. Use only read-only tools and the least-privilege `openid` scope unless refresh/profile claims are actually required.
6. Store any KOR1816 profile separately from the existing event/castle/seating Firestore documents, with source, last-sync timestamp, and explicit user ownership.
7. Add rate limiting, session expiry/revocation, CSRF protection, error handling, and a user-facing disconnect action before public release.

## Fields to map and verify

- Identity/profile: player ID, nickname, kingdom, alliance, avatar, power.
- Progression: Town Center level, heroes, combat stats.
- Troops: only if `get_my_profile` returns actual counts for the connected test account.
- Mystic Trial / rankings / governor gear / charms: test availability; do not infer that the account endpoint returns these just because another public API does.
- K710's 30-day session behavior is a reference, not a value to copy without confirming the provider's token lifetime and refresh rules.

## Current state

- `profile-preview.html` is a UI prototype and now has fields for avatar, Town Center, Mystic Trial, kills, heroes, equipment, and troop details.
- `profile-api/worker.js` is still a separate public-data MightPulse lookup template; it is not an OAuth account connector.
- No OAuth flow, provider client registration, token storage, profile persistence, or live integration test has been deployed.
- The production site and legacy site have not been changed.