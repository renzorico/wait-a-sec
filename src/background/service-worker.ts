import { SiteRule, Message } from "../types";
import { getStorage, initStorage, recordStat, incrementAttempts } from "./storage";

// ---------------------------------------------------------------------------
// URL matching
// ---------------------------------------------------------------------------

/**
 * Returns true if the URL's hostname matches the stored pattern.
 * Pattern "reddit.com" matches "reddit.com" and "www.reddit.com" but not
 * "notreddit.com".
 */
function matchesPattern(url: string, pattern: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const normalized = pattern.toLowerCase().replace(/^www\./, "");
    return hostname === normalized || hostname.endsWith(`.${normalized}`);
  } catch {
    return false;
  }
}

function findMatchingRule(url: string, rules: SiteRule[]): SiteRule | null {
  return (
    rules.find((rule) => rule.enabled && matchesPattern(url, rule.pattern)) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Navigation interception
// ---------------------------------------------------------------------------

chrome.webNavigation.onCommitted.addListener(
  async (details) => {
    // Only intercept top-level navigations, not iframes or subresources
    if (details.frameId !== 0) return;

    // Skip internal browser pages
    if (!details.url.startsWith("http://") && !details.url.startsWith("https://")) return;

    const { rules, globalEnabled } = await getStorage();

    if (!globalEnabled) return;

    const match = findMatchingRule(details.url, rules);
    if (!match) return;

    await incrementAttempts(match.pattern);

    // Tell the content script to activate the blur overlay
    try {
      await chrome.tabs.sendMessage(details.tabId, {
        type: "RULE_MATCHED",
        rule: match,
      } satisfies Message);
    } catch {
      // Content script may not be ready yet on first load — inject directly
      await chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: activateBlur,
        args: [match.delaySeconds, match.pattern],
      });
    }
  },
  { url: [{ schemes: ["http", "https"] }] }
);

// ---------------------------------------------------------------------------
// Fallback: inject blur via scripting API if content script message fails
// ---------------------------------------------------------------------------

/**
 * Injected directly into the page when the content script isn't ready.
 * Must be a self-contained function — no imports.
 */
function activateBlur(delaySeconds: number, pattern: string): void {
  window.dispatchEvent(
    new CustomEvent("wait-a-sec:activate", {
      detail: { delaySeconds, pattern },
    })
  );
}

// ---------------------------------------------------------------------------
// Message handling (from content script and popup)
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === "RECORD_STAT") {
      recordStat(message.pattern, message.outcome)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => {
          console.error("[wait-a-sec] Failed to record stat:", err);
          sendResponse({ ok: false });
        });
      return true; // keep message channel open for async response
    }
    return false;
  }
);

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  await initStorage();
  console.log("[wait-a-sec] Extension installed. Storage initialized.");
});
