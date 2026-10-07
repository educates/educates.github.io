import type { Finding, Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface TrailingSlashLinksOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
  /**
   * The URL paths ending in a slash that the build serves, such as `/` and
   * the redirect pages at directory URLs.
   */
  slashPaths: string[];
}

/**
 * No link on the site ends in a slash, except to the paths it is given.
 * GitHub Pages answers `/page/` with a 404 although it serves `/page`, and
 * the internal link check cannot see it, because lychee drops a trailing
 * slash before it looks for the file. Every HTML file is checked, redirect
 * pages included; a link is on the site when it resolves to `origin`.
 */
export function trailingSlashLinks({
  origin,
  slashPaths,
}: TrailingSlashLinksOptions): Rule {
  const allowed = new Set(slashPaths);
  return {
    name: "trailing-slash-links",
    check(build) {
      const findings: Finding[] = [];
      const htmlFiles = [...build.files]
        .filter((file) => file.endsWith(".html"))
        .sort();
      for (const file of htmlFiles) {
        const base = new URL(servedPath(file), origin);
        for (const link of build.html(file).querySelectorAll("a[href]")) {
          const href = (link.getAttribute("href") ?? "").trim();
          let url: URL;
          try {
            url = new URL(href, base);
          } catch {
            continue;
          }
          if (url.origin !== origin) continue;
          const path = url.pathname;
          if (!path.endsWith("/") || allowed.has(path)) continue;
          findings.push({
            rule: "trailing-slash-links",
            severity: "error",
            message: `${file} links ${href}, which GitHub Pages answers with a 404: ${path} ends in a slash`,
          });
        }
      }
      return findings;
    },
  };
}

/** The URL path a file is served at, a directory's for an `index.html`. */
function servedPath(file: string): string {
  if (file === "index.html" || file.endsWith("/index.html")) {
    return `/${file.slice(0, -"index.html".length)}`;
  }
  return urlPathOf(file);
}
