import { StorageSchema, SiteRule, SiteStat } from "../types";

// ---------------------------------------------------------------------------
// Storage helpers (options page reads/writes directly — no background needed)
// ---------------------------------------------------------------------------

async function load(): Promise<StorageSchema> {
  const result = await chrome.storage.local.get(null);
  return {
    rules: result["rules"] ?? [],
    stats: result["stats"] ?? {},
    globalEnabled: result["globalEnabled"] ?? true,
  };
}

async function saveRules(rules: SiteRule[]): Promise<void> {
  await chrome.storage.local.set({ rules });
}

async function saveGlobalEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ globalEnabled: enabled });
}

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------

const globalCheckbox = document.getElementById("global-enabled") as HTMLInputElement;
const globalLabel = document.getElementById("global-label") as HTMLElement;
const addForm = document.getElementById("add-form") as HTMLFormElement;
const inputDomain = document.getElementById("input-domain") as HTMLInputElement;
const inputDelay = document.getElementById("input-delay") as HTMLInputElement;
const addError = document.getElementById("add-error") as HTMLElement;
const rulesList = document.getElementById("rules-list") as HTMLUListElement;
const emptyState = document.getElementById("empty-state") as HTMLElement;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let rules: SiteRule[] = [];
let stats: Record<string, SiteStat> = {};

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderRules(): void {
  rulesList.innerHTML = "";

  if (rules.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  for (const rule of rules) {
    rulesList.appendChild(buildRuleItem(rule));
  }
}

function buildRuleItem(rule: SiteRule): HTMLLIElement {
  const stat = stats[rule.pattern];
  const li = document.createElement("li");
  li.className = `rule-item${rule.enabled ? "" : " disabled"}`;
  li.dataset["pattern"] = rule.pattern;

  li.innerHTML = `
    <div class="rule-domain">${escapeHtml(rule.pattern)}</div>
    <div class="rule-stats">
      ${stat ? `
        <span class="rule-stat-pill attempts">${stat.attempts} attempt${stat.attempts !== 1 ? "s" : ""}</span>
        <span class="rule-stat-pill proceeded">${stat.proceeded} continued</span>
        <span class="rule-stat-pill skipped">${stat.skipped} turned back</span>
      ` : `<span class="rule-stat-pill no-data">no data yet</span>`}
    </div>
    <div class="rule-controls">
      <label class="rule-delay-wrap" title="Delay in seconds">
        <input
          class="rule-delay-input"
          type="number"
          min="1"
          max="120"
          value="${rule.delaySeconds}"
        />
        <span class="rule-delay-unit">s</span>
      </label>
      <label class="rule-toggle">
        <input type="checkbox" ${rule.enabled ? "checked" : ""} />
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
      </label>
      <button class="btn-delete" title="Remove site" aria-label="Remove ${escapeHtml(rule.pattern)}">
        ×
      </button>
    </div>
  `;

  // Delay change
  const delayInput = li.querySelector<HTMLInputElement>(".rule-delay-input")!;
  delayInput.addEventListener("change", () => {
    const val = parseInt(delayInput.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 120) {
      updateRule(rule.pattern, { delaySeconds: val });
    } else {
      delayInput.value = String(rule.delaySeconds);
    }
  });

  // Toggle enabled
  const toggleInput = li.querySelector<HTMLInputElement>(".rule-toggle input")!;
  toggleInput.addEventListener("change", () => {
    updateRule(rule.pattern, { enabled: toggleInput.checked });
    li.classList.toggle("disabled", !toggleInput.checked);
  });

  // Delete
  const deleteBtn = li.querySelector<HTMLButtonElement>(".btn-delete")!;
  deleteBtn.addEventListener("click", () => deleteRule(rule.pattern));

  return li;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

function updateRule(pattern: string, patch: Partial<SiteRule>): void {
  rules = rules.map((r) =>
    r.pattern === pattern ? { ...r, ...patch } : r
  );
  saveRules(rules);
}

function deleteRule(pattern: string): void {
  rules = rules.filter((r) => r.pattern !== pattern);
  saveRules(rules);
  renderRules();
}

function addRule(pattern: string, delaySeconds: number): string | null {
  const normalized = pattern.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  if (!normalized || !normalized.includes(".")) {
    return "Enter a valid domain, e.g. twitter.com";
  }

  if (rules.some((r) => r.pattern === normalized)) {
    return `${normalized} is already in your list`;
  }

  rules = [...rules, { pattern: normalized, delaySeconds, enabled: true }];
  saveRules(rules);
  renderRules();
  return null;
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

globalCheckbox.addEventListener("change", () => {
  const enabled = globalCheckbox.checked;
  globalLabel.textContent = enabled ? "enabled" : "paused";
  saveGlobalEnabled(enabled);
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const domain = inputDomain.value.trim();
  const delay = parseInt(inputDelay.value, 10);
  const error = addRule(domain, isNaN(delay) ? 10 : delay);

  if (error) {
    addError.textContent = error;
    inputDomain.focus();
  } else {
    addError.textContent = "";
    inputDomain.value = "";
    inputDomain.focus();
  }
});

inputDomain.addEventListener("input", () => {
  if (addError.textContent) addError.textContent = "";
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

async function init(): Promise<void> {
  const data = await load();
  rules = data.rules;
  stats = data.stats;

  globalCheckbox.checked = data.globalEnabled;
  globalLabel.textContent = data.globalEnabled ? "enabled" : "paused";

  renderRules();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();
