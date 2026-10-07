// @ts-check
// Expressive Code renders every fenced code block in Markdown and MDX, and
// the <Code> component, with the site's fonts and both themes: a frame with
// the fence's `title="..."`, a terminal frame for shell languages, line
// markers such as `{2-3}`, and a copy button. The Astro integration in
// astro.config.ts reads this file; options that hold functions, such as
// `themeCssSelector`, must live here rather than in the Astro config.
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  // The light theme is the base. The dark one applies when `data-theme` is
  // dark, which the theme script sets from the visitor's choice or the
  // system theme, and without JavaScript when the system prefers dark: the
  // same rules as src/styles/tokens.css.
  themes: ["github-light", "github-dark"],
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
  shiki: {
    // Docusaurus's name for a block left unhighlighted.
    langAlias: { "no-highlight": "txt" },
  },
  frames: {
    // A comment naming a file at the top of a block stays code; a title
    // comes from the fence's `title="..."` only.
    extractFileNameFromCode: false,
  },
  // Frames take their colours from the design tokens, which follow the
  // theme on their own.
  styleOverrides: {
    codeFontFamily: "var(--font-mono)",
    uiFontFamily: "var(--font-sans)",
    borderRadius: "var(--radius-control)",
    borderColor: "var(--color-line)",
    focusBorder: "var(--color-accent)",
    codeBackground: "var(--color-surface)",
    frames: {
      shadowColor: "var(--color-shadow)",
      editorTabBarBackground: "var(--color-chrome)",
      editorTabBarBorderBottomColor: "var(--color-line)",
      editorActiveTabBackground: "var(--color-surface)",
      editorActiveTabForeground: "var(--color-ink)",
      editorActiveTabIndicatorTopColor: "var(--color-accent)",
      terminalTitlebarBackground: "var(--color-chrome)",
      terminalTitlebarForeground: "var(--color-ink-muted)",
      terminalTitlebarBorderBottomColor: "var(--color-line)",
      terminalBackground: "var(--color-surface)",
    },
    textMarkers: {
      markBackground: "var(--color-accent-soft)",
      markBorderColor: "var(--color-accent)",
    },
  },
});
