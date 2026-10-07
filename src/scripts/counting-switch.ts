// The counting switch on /privacy: shows whether this browser's page views
// are counted, and turns counting off or on through the opt-out flag that
// the loader and count.js both read.

import {
  countingState,
  setCounting,
  type CountingState,
} from "../lib/analytics.ts";

const statusText: Record<CountingState, string> = {
  on: "Counting is on: this browser's page views are counted.",
  off: "Counting is off: this browser sends nothing to GoatCounter.",
  blocked:
    "Your browser blocks this site's storage, so nothing is counted from it and no choice can be kept.",
};

/** Wires the `[data-counting-switch]` on the page. */
export function setUpCountingSwitch(): void {
  const control = document.querySelector<HTMLElement>("[data-counting-switch]");
  const button = control?.querySelector<HTMLButtonElement>("button");
  const status = control?.querySelector<HTMLElement>("[data-counting-status]");
  if (!control || !button || !status) return;

  const show = (state: CountingState) => {
    button.setAttribute("aria-checked", String(state === "on"));
    button.disabled = state === "blocked";
    status.textContent = statusText[state];
  };

  button.addEventListener("click", () => {
    const counted = button.getAttribute("aria-checked") !== "true";
    show(setCounting(() => localStorage, counted));
  });
  show(countingState(() => localStorage));
}
