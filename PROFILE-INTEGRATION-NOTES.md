# KOR1816 player profile integration notes

Updated: 2026-10-20

## Goal
Build profile pages for the 1816 alliance and immigrant community without changing the existing event-registration, castle-war, castle-layout, seating, Viking, or Glory data.

## Current repository facts
- The current site is a static GitHub Pages app.
- The current app initializes Firebase Auth and Firestore in `app.js`.
- Existing event data is stored under Firestore documents in `siteData`; profile records must use a separate namespace and must never reuse event document IDs.
- `profile-preview.html` is only a browser-side prototype. It does not authenticate game ownership, call a game API, upload screenshots, or save profiles.

## Public-source investigation (not yet an integration contract)
1. **Kingshot Intel player lookup** (`https://kingshotintel.com/player-lookup`) describes searching by Player ID or name and shows indexed public profiles, power signals, kingdom context, and local history. Its own page distinguishes synced global data from local history and uncollected values. It is an independent third-party service, not an official game API.
2. **Kingdom 710 context** (`https://kingshot.net/nexus/710`) publishes kingdom-level information such as bracket, stage, transfer caps, and KvK history. This is useful for kingdom context, but it is not by itself proof that an individual player's full roster is available.
3. **MightPulse** is referenced by public third-party projects as a player-data source with an authenticated endpoint for a player's public profile. This appears to require a provider API key and current terms/access confirmation. Do not call it directly from a static browser page or expose a key in this repository.
4. A public community analysis of the game's gift-code backend reports that the old `/player` endpoint returned HTTP 404 in July 2026. Treat that as a warning that unofficial endpoints can disappear; do not build production around it without a fresh, authorized verification.
5. Full hero, troop, skill, equipment, and charm data must be verified field-by-field. Do not assume a player ID alone can retrieve every detail.

## Proposed profile record (separate from event data)
Use a dedicated collection/document namespace such as `playerProfiles/{playerId}` only after Firestore rules and authentication are reviewed:
- `playerId`: stable game ID, stored as a string
- `kingdomId`, `nickname`, `allianceName`, `avatarUrl`
- `power`, `townCenterLevel`, `troopSummary`
- `heroes[]`: name, generation, stars, skill levels, source, lastVerifiedAt
- `equipment[]`: slot, level, enhancement, source, lastVerifiedAt
- `profileImageRef`: optional Storage reference, not a public data URL
- `communitySpace`: `1816` or `immigrant`
- `ownerUid`: Firebase UID for the verified profile owner
- `source`, `fetchedAt`, `lastUserConfirmedAt`, `schemaVersion`

## Source/verification rules
- Mark each field as provider-fetched, screenshot-read, or user-entered.
- Show last-updated time and allow the owner to correct stale/wrong values.
- Game ID lookup is not ownership proof. Before allowing edits, require an approved ownership challenge or moderator review.
- Never ask for game passwords, email passwords, or one-time verification codes.
- Keep provider credentials server-side in a trusted backend; a static GitHub Pages frontend must never contain provider secrets.
- Enforce access in Firebase Security Rules/backend, not by hiding buttons or links in the UI.
- Separate 1816 and immigrant permissions at the data/rules layer.
- Preserve the current screenshot flow as a fallback for fields that cannot be retrieved.
- Do not change any existing `siteData` documents while adding profile functionality.

## Next implementation sequence
1. Confirm the exact third-party site the user means by “710” and inspect the fields actually visible there.
2. Confirm API availability, terms, and credentials for an allowed data provider.
3. Implement a server-side lookup adapter that returns only approved public fields; add timeout, rate limit, and source timestamp.
4. Test with one consenting sample player ID.
5. Add a separate Firestore profile collection only after reviewing existing Firestore Security Rules and owner-verification design.
6. Add screenshot OCR as an optional helper, with a manual confirmation step.
7. Test both community spaces and verify that existing event data remains unchanged.

## Status
Prototype UI only. No live player API, OCR, ownership verification, Firestore profile writes, or production routing has been connected yet.
