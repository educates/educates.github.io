import type { HTMLElement } from "node-html-parser";

/**
 * Every URL a piece of parsed HTML links, loads or plays, as written and in
 * document order: `href`, `src` and `poster` values, and each candidate of
 * a `srcset`.
 */
export function urlsIn(html: HTMLElement): string[] {
  const urls: string[] = [];
  for (const element of html.querySelectorAll(
    "[href], [src], [srcset], [poster]",
  )) {
    for (const name of ["href", "src", "poster"]) {
      const value = element.getAttribute(name);
      if (value !== undefined) urls.push(value.trim());
    }
    const srcset = element.getAttribute("srcset");
    if (srcset !== undefined) {
      for (const candidate of srcset.split(",")) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url) urls.push(url);
      }
    }
  }
  return urls;
}
