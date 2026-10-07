// The design tokens as JavaScript values, read from tokens.css so the CSS
// file stays their one source. Code that cannot use CSS custom properties,
// such as an image renderer, takes its colors from here.

import tokensCss from "./tokens.css?raw";

/** Token values by custom property name, such as `--color-accent`. */
export type Tokens = Readonly<Record<string, string>>;

const LIGHT = ":root";
const SYSTEM_DARK = ':root:not([data-theme="light"])';
const CHOSEN_DARK = ':root[data-theme="dark"]';

/**
 * Reads the light and dark tokens from the text of tokens.css. The dark
 * tokens are the light ones with the dark overrides applied. Throws when the
 * file uses another selector, when its two dark blocks differ, or when a
 * dark token has no light value.
 */
export function parseTokens(css: string): { light: Tokens; dark: Tokens } {
  const blocks = new Map<string, Record<string, string>>();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, selector, body] of withoutComments.matchAll(
    /([^{}]+)\{([^{}]*)\}/g,
  )) {
    const name = selector.trim();
    if (![LIGHT, SYSTEM_DARK, CHOSEN_DARK].includes(name)) {
      throw new Error(`tokens.css: unexpected selector ${name}`);
    }
    blocks.set(name, declarations(body));
  }

  const light = blocks.get(LIGHT);
  if (!light || Object.keys(light).length === 0) {
    // Vitest, for one, replaces CSS files with empty strings unless its
    // `css` option includes them.
    throw new Error("tokens.css: no tokens under :root");
  }
  const systemDark = blocks.get(SYSTEM_DARK) ?? {};
  const chosenDark = blocks.get(CHOSEN_DARK) ?? {};
  if (JSON.stringify(systemDark) !== JSON.stringify(chosenDark)) {
    throw new Error("tokens.css: the two dark blocks differ");
  }
  for (const name of Object.keys(chosenDark)) {
    if (!(name in light)) {
      throw new Error(`tokens.css: ${name} has a dark value but no light one`);
    }
  }
  return { light, dark: { ...light, ...chosenDark } };
}

function declarations(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const declaration of body.split(";")) {
    const separator = declaration.indexOf(":");
    if (separator < 0) continue;
    const name = declaration.slice(0, separator).trim();
    if (name.startsWith("--")) {
      result[name] = declaration.slice(separator + 1).trim();
    }
  }
  return result;
}

export const tokens = parseTokens(tokensCss);

/** The light tokens, the palette of every Open Graph image. */
export const lightTokens = tokens.light;
