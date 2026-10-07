// How code blocks in Markdown and MDX render, through Expressive Code: a
// frame with the fence's `title="..."`, a terminal frame for shell
// languages, line markers such as `{2-3}`, and a copy button. The frames
// take their colours from the design tokens of each theme, and follow the
// theme the way the tokens do: the system setting until the visitor
// chooses, then `data-theme` on the root element.

import type {
  AstroExpressiveCodeOptions,
  ExpressiveCodeTheme,
} from "astro-expressive-code";
import { tokens } from "../styles/tokens.ts";

/** A style setting that takes the value of design token `name` in each theme. */
function token(name: string) {
  return ({ theme }: { theme: ExpressiveCodeTheme }) => {
    const value = (theme.type === "dark" ? tokens.dark : tokens.light)[name];
    if (value === undefined) throw new Error(`No design token ${name}`);
    return value;
  };
}

export const expressiveCode: AstroExpressiveCodeOptions = {
  // The light theme comes first: its colours are the default, and the dark
  // one applies under the same selectors as the dark tokens.
  themes: ["github-light", "github-dark"],
  useDarkModeMediaQuery: true,
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
  styleOverrides: {
    borderRadius: "var(--radius-control)",
    borderColor: token("--color-line"),
    codeFontFamily: "var(--font-mono)",
    codeFontSize: "14px",
    codeBackground: token("--color-surface"),
    uiFontFamily: "var(--font-sans)",
    focusBorder: token("--color-accent"),
    frames: {
      shadowColor: token("--color-shadow"),
      editorTabBarBackground: token("--color-chrome"),
      editorTabBarBorderBottomColor: token("--color-line"),
      editorActiveTabBackground: token("--color-surface"),
      editorActiveTabForeground: token("--color-ink"),
      editorActiveTabIndicatorTopColor: token("--color-accent"),
      terminalTitlebarBackground: token("--color-chrome"),
      terminalTitlebarForeground: token("--color-ink-muted"),
      terminalTitlebarBorderBottomColor: token("--color-line"),
      terminalBackground: token("--color-surface"),
      inlineButtonForeground: token("--color-ink-muted"),
      tooltipSuccessBackground: token("--color-accent-strong"),
      tooltipSuccessForeground: token("--color-on-accent"),
    },
    textMarkers: {
      markBackground: token("--color-accent-soft"),
      markBorderColor: token("--color-accent"),
    },
  },
};
