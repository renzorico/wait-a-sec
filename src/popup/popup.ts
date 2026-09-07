import { StorageSchema, SiteRule, SiteStat } from "../types";

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

async function load(): Promise<StorageSchema> {
  const result = await chrome.storage.local.get(null);
  return {
    rules: result["rules"] ?? [],
    stats: result["stats"] ?? {},
    globalEnabled: result["globalEnabled"] ?? true,
  };
}

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------

const globalCheckbox = document.getElementById("global-enabled") as HTMLInputElement;
const totalAttempts = document.getElementById("total-attempts") as HTMLElement;
const totalProceeded = document.getElementById("total-proceeded") as HTMLElement;
const totalSkipped = document.getElementById("total-skipped") as HTMLElement;
const siteList = document.getElementById("site-list") as HTMLUListElement;
const emptyEl = document.getElementById("empty") as HTMLElement;
const btnSettings = document.getElementById("btn-settings") as HTMLButtonElement;

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderTotals(stats: Record<string, SiteStat>): void {
  const values = Object.values(stats);
  totalAttempts.textContent = String(values.reduce((s, v) => s + v.attempts, 0));
  totalProceeded.textContent = String(values.reduce((s, v) => s + v.proceeded, 0));
  totalSkipped.textContent = String(values.reduce((s, v) => s + v.skipped, 0));
}

function renderSites(rules: SiteRule[], stats: Record<string, SiteStat>): void {
  siteList.innerHTML = "";

  // Sort by most attempts desc, then alphabetically
  const sorted = [...rules].sort((a, b) => {
    const aAttempts = stats[a.pattern]?.attempts ?? 0;
    const bAttempts = stats[b.pattern]?.attempts ?? 0;
    return bAttempts - aAttempts || a.pattern.localeCompare(b.pattern);
  });

  if (sorted.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  for (const rule of sorted) {
    const stat = stats[rule.pattern];
    const li = document.createElement("li");
    li.className = `site-item${rule.enabled ? "" : " disabled"}`;

    const statsText = stat
      ? `${stat.proceeded} in · ${stat.skipped} back`
      : "new";

    li.innerHTML = `
      <span class="site-domain">${escapeHtml(rule.pattern)}</span>
      <span class="site-stats">${statsText}</span>
    `;

    siteList.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

globalCheckbox.addEventListener("change", async () => {
  await chrome.storage.local.set({ globalEnabled: globalCheckbox.checked });
});

btnSettings.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

async function init(): Promise<void> {
  const { rules, stats, globalEnabled } = await load();

  globalCheckbox.checked = globalEnabled;
  renderTotals(stats);
  renderSites(rules, stats);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();
