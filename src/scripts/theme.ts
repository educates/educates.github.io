// The theme toggle. `data-theme` on the root element names the theme in
// use, `light` or `dark`; ThemeScript.astro sets it before first paint. The
// page follows the system theme until the visitor uses the toggle, and only
// then is their choice remembered in localStorage.

export const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

/**
 * Wires every `[data-theme-toggle]` button on the page, and keeps the page
 * on the system theme, as it changes, until the visitor chooses one.
 */
export function setUpThemeToggles(): void {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    "[data-theme-toggle]",
  );
  let chosen = storedTheme() !== undefined;

  const current = (): Theme => {
    const theme = root.dataset.theme;
    if (theme === "light" || theme === "dark") return theme;
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
      chosen = true;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Storage is blocked: the choice lasts until the page is left.
      }
      sync();
    });
  }
  systemDark.addEventListener("change", () => {
    if (!chosen) root.dataset.theme = systemDark.matches ? "dark" : "light";
    sync();
  });
  sync();
}

/** The theme the visitor chose on an earlier page, if storage holds one. */
function storedTheme(): Theme | undefined {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return theme === "light" || theme === "dark" ? theme : undefined;
  } catch {
    return undefined;
  }
}
