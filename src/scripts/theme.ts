// The theme toggle. The visitor's choice is `data-theme` on the root
// element, `light` or `dark`, remembered in localStorage; until they choose,
// the page follows prefers-color-scheme. ThemeScript.astro applies a stored
// choice before first paint.

export const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

/** Wires every `[data-theme-toggle]` button on the page. */
export function setUpThemeToggles(): void {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    "[data-theme-toggle]",
  );

  const current = (): Theme => {
    const chosen = root.dataset.theme;
    if (chosen === "light" || chosen === "dark") return chosen;
    return systemDark.matches ? "dark" : "light";
  };

  // A toggle button for the dark theme: pressed while the page is dark.
  const sync = () => {
    const dark = String(current() === "dark");
    for (const button of buttons) button.setAttribute("aria-pressed", dark);
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const next: Theme = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Storage is blocked: the choice lasts until the page is left.
      }
      sync();
    });
  }
  systemDark.addEventListener("change", sync);
  sync();
}
