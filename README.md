# Wait a Sec

A browser extension that adds intentional friction before you open distracting websites. The page gradually unblurs over N seconds — giving you time to decide if you actually want to be there.

Works in Chrome, Comet, Edge, and Firefox.

## Features

- Gradual unblur animation over a configurable delay
- Per-site rules with individual delay durations
- Usage stats: attempts, proceeded, skipped
- Settings page to manage your site list
- Global on/off toggle

## Setup (development)

**Requirements:** Node.js 18+

```bash
npm install
npm run dev        # watch mode — outputs to dist/
```

Load the extension in your browser:
- Chrome / Comet / Edge: `chrome://extensions` → Enable developer mode → Load unpacked → select `dist/`
- Firefox: `about:debugging` → Load Temporary Add-on → select `dist/manifest.json`

## Build for production

```bash
npm run build              # Chrome / Comet / Edge
npm run build:firefox      # Firefox
npm run package            # produces wait-a-sec-chrome.zip for Chrome Web Store
```

## Publishing

- **Chrome Web Store**: upload `wait-a-sec-chrome.zip` at [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- **Firefox Add-ons**: upload the Firefox build at [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)

One-time Chrome developer fee: $5.

## Project structure

```
src/
  manifest.json         Extension manifest (MV3)
  types.ts              Shared types and storage schema
  background/           Service worker — intercepts navigation
  content/              Blur overlay injected into pages
  options/              Settings page (manage rules)
  popup/                Toolbar popup (quick stats + toggle)
  assets/icons/         Extension icons (16, 32, 48, 128px)
scripts/
  package.js            Zips dist/ for Chrome Web Store upload
```

## Environment variables

None required. All settings are stored in `chrome.storage.local`.
