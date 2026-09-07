export interface SiteRule {
  pattern: string;       // e.g. "twitter.com", "reddit.com"
  delaySeconds: number;  // unblur duration in seconds
  enabled: boolean;
}

export interface SiteStat {
  pattern: string;
  attempts: number;      // how many times the blur screen was shown
  skipped: number;       // how many times user closed the tab / went back
  proceeded: number;     // how many times user waited and accessed the site
  lastAttempt: number;   // unix timestamp ms
}

export interface StorageSchema {
  rules: SiteRule[];
  stats: Record<string, SiteStat>;  // keyed by pattern
  globalEnabled: boolean;
}

export const STORAGE_DEFAULTS: StorageSchema = {
  rules: [],
  stats: {},
  globalEnabled: true,
};

// Messages between background <-> content <-> popup
export type Message =
  | { type: "CHECK_URL"; url: string }
  | { type: "RULE_MATCHED"; rule: SiteRule }
  | { type: "NO_RULE" }
  | { type: "RECORD_STAT"; pattern: string; outcome: "proceeded" | "skipped" };
