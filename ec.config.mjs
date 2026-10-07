// @ts-check
// Expressive Code renders every fenced code block in Markdown and MDX, and
// the <Code> component, with the site's fonts and both themes. The Astro
// integration in astro.config.ts reads this file; options that hold
// functions, such as `themeCssSelector`, must live here rather than in the
// Astro config.
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  // The light theme is the base. The dark one applies when `data-theme` is
  // dark, which the theme script sets from the visitor's choice or the
  // system theme, and without JavaScript when the system prefers dark: the
  // same rules as src/styles/tokens.css.
  themes: ["github-light", "github-dark"],
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
  styleOverrides: {
    codeFontFamily: "var(--font-mono)",
    uiFontFamily: "var(--font-sans)",
    borderRadius: "var(--radius-control)",
    borderColor: "var(--color-line)",
    focusBorder: "var(--color-accent)",
  },
});
