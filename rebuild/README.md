# KOR1816 rebuild (work in progress)

This directory is an isolated development scaffold on branch `rebuild/full-rebuild-2026-10-17`. It is not the production site and is not ready for deployment.

## Confirmed scope
- Ten buttons, in this order: 홈, 공지, 성검쟁탈, 3대연맹전, 캐슬참전, 캐슬전, 캐슬배치, 자리배치, 바이킹, 영광의순간들.
- Keep the content and behavior of the reference site's `battleJoin`, `castlewar1`, and `castlelayout1` pages; remove only the visible “1” suffix from the last two titles. Do not import the old reference pages named simply `castlewar` and `castle`.
- Eight languages: Korean, English, Japanese, Chinese, German, Italian, Spanish, Turkish. The language selection persists across routes.
- Notice content is authored in Korean; prewritten translations are shown by language selection.
- Preserve Google administrator sign-in and the current authorized-admin list after verifying the existing implementation.
- Common edit/save/refresh controls; page data is independent. Cloud saves must be verified after refresh and from a second device.
- Use image URLs from `KOR1816/1816KOR` where possible; no duplicate upload required for existing images.
- Do not deploy or modify production `main` until the owner approves.

## Required before deployment
- Port all page content and page-specific interactions.
- Confirm Firebase document mapping and isolate Castle War / Castle Layout / Castle Participation writes.
- Verify authentication, save errors, and server-vs-local behavior.
- Test direct URLs, refresh, browser back/forward, all eight languages, desktop/mobile layouts, and all ten buttons.
- Inspect GitHub Actions / Pages build status and compare with the production backup.
