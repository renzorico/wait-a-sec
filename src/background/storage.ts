import { StorageSchema, STORAGE_DEFAULTS, SiteStat } from "../types";

export async function getStorage(): Promise<StorageSchema> {
  const result = await chrome.storage.local.get(null);

  return {
    rules: result["rules"] ?? STORAGE_DEFAULTS.rules,
    stats: result["stats"] ?? STORAGE_DEFAULTS.stats,
    globalEnabled: result["globalEnabled"] ?? STORAGE_DEFAULTS.globalEnabled,
  };
}

export async function setStorage(data: Partial<StorageSchema>): Promise<void> {
  await chrome.storage.local.set(data);
}

export async function initStorage(): Promise<void> {
  const existing = await chrome.storage.local.get(null);
  const updates: Partial<StorageSchema> = {};

  if (existing["rules"] === undefined) updates.rules = STORAGE_DEFAULTS.rules;
  if (existing["stats"] === undefined) updates.stats = STORAGE_DEFAULTS.stats;
  if (existing["globalEnabled"] === undefined) updates.globalEnabled = STORAGE_DEFAULTS.globalEnabled;

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

export async function recordStat(
  pattern: string,
  outcome: "proceeded" | "skipped"
): Promise<void> {
  const { stats } = await getStorage();

  const existing: SiteStat = stats[pattern] ?? {
    pattern,
    attempts: 0,
    skipped: 0,
    proceeded: 0,
    lastAttempt: 0,
  };

  const updated: SiteStat = {
    ...existing,
    [outcome]: existing[outcome] + 1,
    lastAttempt: Date.now(),
  };

  await chrome.storage.local.set({
    stats: { ...stats, [pattern]: updated },
  });
}

export async function incrementAttempts(pattern: string): Promise<void> {
  const { stats } = await getStorage();

  const existing: SiteStat = stats[pattern] ?? {
    pattern,
    attempts: 0,
    skipped: 0,
    proceeded: 0,
    lastAttempt: 0,
  };

  await chrome.storage.local.set({
    stats: {
      ...stats,
      [pattern]: {
        ...existing,
        attempts: existing.attempts + 1,
        lastAttempt: Date.now(),
      },
    },
  });
}
