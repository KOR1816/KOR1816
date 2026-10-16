# KOR1816 rebuild — work in progress

Development branch: `rebuild/full-rebuild-2026-10-17`

This folder is an isolated development scaffold. It is not deployed and is not yet a finished replacement.

## Current implementation
- Fresh responsive HTML/CSS/JavaScript rather than reusing the old page scripts.
- Ten navigation buttons in the requested order, with a single active-page highlight and direct hash routes.
- Eight language choices; language choice is stored locally and carried across navigation.
- Existing public images are referenced from the `KOR1816/1816KOR` repository, avoiding duplicate uploads.
- Existing Firestore records are read as migration sources only. New saves go to separate `rebuild_*` or `*_rebuild_v1` records, so edits from this new build do not overwrite the reference site's records.
- Castle Participation, Castle War, and Castle Layout use separate new records; Castle War and Layout may read the old roster/layout as initial content, but their writes are independent.
- Notice content is stored as Korean source with prewritten translations selected by language.
- Google administrator sign-in uses the current site's approved administrator email list.

## Not complete / needs testing
- Some page controls and translations still need a careful visual and behavior review.
- Firebase authorization rules must be tested in a real browser, including admin sign-in and participant registration.
- Test all saves against the shared server, then refresh and verify on a second device.
- Check all 10 routes, browser back/forward, mobile horizontal scrolling, and all 8 languages.
- Confirm no existing record in the reference site was modified by this rebuild.
- Do not replace production `index.html` or deploy until tests pass and the site owner approves.

## Latest static review (2026-10-17)
- JavaScript syntax checks passed for `app.js` and `page-content.js`.
- Verified all 10 route IDs have a matching page section and content template.
- Verified all eight language options are present and all inline event-handler names resolve to declared/global functions.
- Verified Castle War has five columns (Assault, Charge, Finish, North Turret, West Turret), ten numbered slots per column, the `ccc.png` image, and the three requested info panels.
- Fixed the Castle Layout save button so it becomes visible while admin editing is enabled.
- Fixed three selector-iteration errors that could break button translation and Castle War saves; these now use `querySelectorAll` via the shared `$$` helper.
- Standardized all five Castle War columns to render ten numbered slots each, including both turret columns.
- Preserved English-only lines in Korean notice text instead of silently filtering them during load.
- Re-ran static syntax checks for `app.js` and `page-content.js`; both parse successfully, all ten route IDs have templates, new document IDs are unique, and the selector-iteration scan is clean.
- Verified the image filenames referenced by the rebuild exist in the source repository.
- Confirmed all rebuild writes target separate rebuild documents; legacy documents are read-only migration sources.
- Production `index.html` is still unchanged.

## Still not verified
- No real browser session has been run against this branch.
- Google sign-in, Firestore write permissions for new document IDs, refresh persistence, and PC/mobile synchronization still require live testing. Do not deploy until these pass.
