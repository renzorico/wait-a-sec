# Wait a Sec — Agent Instructions

## What this project is
A Manifest V3 browser extension. No backend. All state lives in `chrome.storage.local`.
Target browsers: Chrome, Comet (Chromium), Edge, Firefox (via separate build mode).

## Stack
- TypeScript (strict mode)
- Vite + vite-plugin-web-extension for bundling
- No UI framework — vanilla HTML/CSS/TS only
- No external runtime dependencies

## Architecture

### Data flow
1. User navigates to a URL
2. Background service worker (`background/service-worker.ts`) checks the URL against stored rules via `webNavigation.onCommitted`
3. If a rule matches, it sends a message to the content script
4. Content script (`content/blur.ts`) injects the blur overlay and starts the unblur animation
5. On completion or skip, content script sends `RECORD_STAT` back to background
6. Background writes updated stats to `chrome.storage.local`

### Storage schema
Defined in `src/types.ts` — `StorageSchema` is the single source of truth.
Always read/write storage via typed wrappers, never raw `chrome.storage.local.get/set` with untyped objects.

### Message passing
All messages typed via the `Message` union in `src/types.ts`. Never send untyped messages.

## Key constraints
- MV3 service workers are ephemeral — do not store state in module-level variables in the background script. Always read from storage.
- Content scripts run at `document_start` but the DOM may not be ready — guard DOM access accordingly.
- Firefox build uses `npm run build:firefox` which injects `browser_specific_settings` via vite.config.ts.

## What to avoid
- No npm packages at runtime — keep the extension self-contained.
- No inline scripts in HTML files (CSP violation in MV3).
- No `eval`, `innerHTML` with user input, or dynamic script injection.
- Do not store any user data outside `chrome.storage.local` (no remote analytics, no external calls).

## Publishing checklist (before submitting to stores)
- Icons at 16, 32, 48, 128px (PNG)
- Privacy policy URL added to manifest and store listing
- All permissions justified in store listing description
- `npm run typecheck` passes with zero errors
- `npm run lint` passes with zero warnings
- `npm run package` produces a valid zip
