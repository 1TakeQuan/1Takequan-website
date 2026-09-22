# CLAUDE.md — 1TakeQuan Official Website

Permanent operating instructions for working on this repository. Read this before making changes.

## PROJECT

- This is the official website for recording artist **1TakeQuan**.
- Treat this as a real production artist website, not a demo project.
- The site should feel like an expanding 1TakeQuan ecosystem: music, videos, content, games, events, fan engagement, and future direct-to-fan features.
- Mobile experience is extremely important because much of the audience will arrive from social media.

## DEVELOPMENT RULES

- Inspect existing implementation before modifying it.
- Preserve working functionality unless explicitly authorized to replace it.
- Do not rewrite large working systems merely because you prefer another architecture.
- Prefer incremental changes that can be tested visually.
- Never silently delete existing features, content, routes, or assets.
- Never modify unrelated files just to clean them up.
- Do not install new dependencies unless they are actually necessary.
- Explain major architectural changes before implementing them.
- Do not expose secrets from `.env.local`.
- Preserve TypeScript strict compatibility.

## TESTING

After meaningful code changes:
1. Run `npx tsc --noEmit`.
2. Run `npm run build` when appropriate.
3. Report actual errors rather than claiming something works based only on code inspection.
4. Visually test UI changes in the running site whenever possible.
5. Check desktop and mobile layouts for visual changes.
6. Do not use the currently broken ESLint command as proof that a change failed until the ESLint configuration is repaired.

## GIT / SAFETY

- Check git status before significant work.
- There are currently uncommitted changes in the repository.
- Do not overwrite, revert, or discard existing uncommitted work.
- Quan Runner currently contains active unfinished work. Do not modify its files unless specifically asked to work on Quan Runner.
- Do not commit, push, reset, checkout, restore, or otherwise alter Git history unless explicitly authorized.

## ARTIST / BRAND

- Artist name: **1TakeQuan**.
- The website should prioritize the artist, music, and personality rather than feeling like a generic technology website.
- Visual decisions should feel intentional, modern, and music-focused.
- Avoid generic template aesthetics.
- Interactive features should support the artist ecosystem rather than exist only as technical demonstrations.
- Existing official artist photography should be preserved rather than AI-redrawn.
- Do not alter the artist's face, jewelry, or identity in existing imagery.

## MUSIC

- Music discovery and playback are core functions of the website.
- Preserve global playback behavior unless explicitly working on the player.
- The current catalog architecture is fragmented across multiple hardcoded sources. Treat this as known technical debt; do not independently restructure it until authorized.
- When the catalog is eventually consolidated, it should have one maintainable source of truth capable of supporting the full 1TakeQuan catalog and future releases.

## DESIGN PROCESS

- For significant visual changes, work iteratively.
- Build something viewable rather than spending excessive time creating architecture before showing a result.
- When given visual feedback, modify the existing implementation when practical instead of repeatedly rebuilding from scratch.
- Finished visual quality matters more than technical cleverness.

## CURRENT PROTECTED AREAS

Until specifically authorized, do not modify:
- Quan Runner files with existing uncommitted changes
- Global PlayerContext / audio behavior
- Environment variables
- API integrations
- Existing production data
