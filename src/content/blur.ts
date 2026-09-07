import { Message, SiteRule } from "../types";

// ---------------------------------------------------------------------------
// Guard: only activate once per page load
// ---------------------------------------------------------------------------

let activated = false;

// ---------------------------------------------------------------------------
// Overlay builder
// ---------------------------------------------------------------------------

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function buildOverlay(pattern: string, delaySeconds: number): HTMLElement {
  const overlay = document.createElement("div");
  overlay.className = "was-overlay";

  overlay.innerHTML = `
    <div class="was-card">
      <span class="was-site">${escapeHtml(pattern)}</span>
      <div class="was-ring-wrap">
        <svg class="was-ring-svg" viewBox="0 0 120 120">
          <circle
            class="was-ring-track"
            cx="60" cy="60" r="${RING_RADIUS}"
          />
          <circle
            class="was-ring-progress"
            cx="60" cy="60" r="${RING_RADIUS}"
            stroke-dasharray="${RING_CIRCUMFERENCE}"
            stroke-dashoffset="0"
          />
        </svg>
        <div class="was-countdown">${delaySeconds}</div>
      </div>
      <button class="was-skip">go back</button>
    </div>
  `;

  return overlay;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Main activation logic
// ---------------------------------------------------------------------------

function activate(rule: SiteRule): void {
  if (activated) return;
  activated = true;

  const { pattern, delaySeconds } = rule;
  const overlay = buildOverlay(pattern, delaySeconds);
  document.documentElement.appendChild(overlay);

  const progress = overlay.querySelector<SVGCircleElement>(".was-ring-progress")!;
  const countdown = overlay.querySelector<HTMLElement>(".was-countdown")!;
  const skipBtn = overlay.querySelector<HTMLButtonElement>(".was-skip")!;

  // --- Unblur animation via rAF ---
  const startTime = performance.now();
  const durationMs = delaySeconds * 1000;
  const MAX_BLUR = 32;

  let animFrame: number;

  function tick(now: number): void {
    const elapsed = now - startTime;
    const progress01 = Math.min(elapsed / durationMs, 1);

    // Backdrop blur: 32px → 0px
    const blur = MAX_BLUR * (1 - progress01);
    const filterValue = `blur(${blur.toFixed(1)}px) brightness(${(0.6 + 0.4 * progress01).toFixed(2)})`;
    overlay.style.backdropFilter = filterValue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (overlay.style as any)["-webkit-backdrop-filter"] = filterValue;

    // Ring: drain from full → empty as time passes
    const offset = RING_CIRCUMFERENCE * progress01;
    progress.style.strokeDashoffset = String(offset);

    // Countdown number (ceil so it shows 1 at the last second, not 0)
    const remaining = Math.ceil((durationMs - elapsed) / 1000);
    countdown.textContent = String(Math.max(remaining, 0));

    if (progress01 < 1) {
      animFrame = requestAnimationFrame(tick);
    } else {
      finish("proceeded");
    }
  }

  animFrame = requestAnimationFrame(tick);

  // --- Skip handler ---
  skipBtn.addEventListener("click", () => {
    cancelAnimationFrame(animFrame);
    finish("skipped");
    history.back();
  });

  // --- Teardown ---
  function finish(outcome: "proceeded" | "skipped"): void {
    overlay.classList.add("was-done");

    chrome.runtime.sendMessage({
      type: "RECORD_STAT",
      pattern,
      outcome,
    } satisfies Message);

    overlay.addEventListener(
      "transitionend",
      () => overlay.remove(),
      { once: true }
    );
  }
}

// ---------------------------------------------------------------------------
// Entry points: message from background OR custom event (fallback)
// ---------------------------------------------------------------------------

function waitForBody(): Promise<void> {
  return new Promise((resolve) => {
    if (document.documentElement) {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    }
  });
}

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === "RULE_MATCHED") {
    waitForBody().then(() => activate(message.rule));
  }
});

window.addEventListener("wait-a-sec:activate", (e) => {
  const { delaySeconds, pattern } = (e as CustomEvent<{ delaySeconds: number; pattern: string }>).detail;
  waitForBody().then(() =>
    activate({ pattern, delaySeconds, enabled: true })
  );
});
