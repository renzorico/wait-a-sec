# Chrome Web Store — Listing Copy

## Extension name
Wait a Sec

---

## Short description
*(132 characters max — currently 118)*

Adds a gradual unblur delay before opening distracting sites. A moment of friction to help you choose intentionally.

---

## Detailed description
*(paste into the Chrome Web Store "Description" field)*

Wait a Sec adds a moment of intentional pause before you open distracting websites.

When you navigate to a site on your list, the page gradually unblurs over a few seconds. You can wait it out and continue — or go back. Either way, you made a choice.

**How it works**
— Add any domain to your list (e.g. twitter.com, reddit.com, youtube.com)
— Set a delay per site (1 to 120 seconds)
— Navigate to the site: the page blurs and a countdown begins
— Wait for the unblur, or click "go back"
— Your choices are tracked so you can see your own patterns over time

**Features**
— Gradual unblur animation with a progress ring and live countdown
— Per-site rules with individual delay durations
— Usage stats: attempts, proceeded, skipped — visible in the popup
— Global on/off toggle to pause without losing your rules
— No accounts, no subscriptions, no data sent anywhere

**Privacy**
All data (your rules and stats) is stored locally on your device. Nothing is transmitted externally. See the full privacy policy at: https://renzorico.github.io/wait-a-sec/privacy

---

## Category
Productivity

---

## Language
English

---

## Privacy policy URL
https://renzorico.github.io/wait-a-sec/privacy

---

## Homepage URL
https://github.com/renzorico/wait-a-sec

---

## Store icon
File: `public/assets/icons/icon128.png` (128×128 px, already in repo)

---

## Screenshots
*(Required: at least 1. Recommended: 3–5. Size: 1280×800 or 640×400 px)*

Suggested shots:
1. The blur overlay in action on a recognizable site (e.g. reddit.com)
2. The options page with a few rules added and stats showing
3. The popup with the aggregate stats and site list

> Take screenshots after loading the extension in dev mode and adding a couple of test rules.
> Tools: browser built-in screenshot (Cmd+Shift+5 on Mac) or CleanShot X.

---

## Promotional tile (optional but recommended)
Size: 440×280 px
Suggested: dark background (#0d0d0d), "wait a sec" logotype centered, hourglass icon below.

---

## Single-purpose justification
*(Chrome Web Store may ask why you need <all_urls> host permissions)*

The extension needs access to all URLs because users can add any domain to their block list. The extension only injects an overlay on URLs that match the user's configured rules — no other action is taken on any other site.

---

## Permissions justification
*(fill in the "Permissions" field during submission)*

- webNavigation: detect navigation to blocked sites
- storage: save rules and stats locally on the user's device
- tabs: send messages between the background service worker and the page content script
- host_permissions (<all_urls>): inject the blur overlay on user-configured domains

---

## Suggested tags / keywords
productivity, focus, distraction, mindfulness, website blocker, screen time, intentional browsing, digital wellbeing

---

## Firefox Add-ons (addons.mozilla.org) — differences
- Build: `npm run build:firefox`
- Submit at: https://addons.mozilla.org/developers/
- Category: Productivity
- The listing copy above applies as-is
- Firefox does not require a $5 developer fee

---

## Pre-submission checklist

- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — clean build
- [ ] `npm run package` — produces `wait-a-sec-chrome.zip`
- [ ] Load unpacked `dist/` in Chrome/Comet — extension icon appears
- [ ] Add a test rule, navigate to the site — blur overlay appears and unblurs
- [ ] Skip button sends you back and records "skipped"
- [ ] Popup shows stats after at least one attempt
- [ ] Settings page: add/delete/toggle rules, delay change persists
- [ ] Global toggle disables interception without clearing rules
- [ ] Privacy policy live at https://renzorico.github.io/wait-a-sec/privacy
- [ ] Screenshots taken at 1280×800
- [ ] Chrome Developer account created (one-time $5 fee)
- [ ] Submit at https://chrome.google.com/webstore/devconsole
