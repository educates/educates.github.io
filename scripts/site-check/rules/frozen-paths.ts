import { urlsIn } from "../html-urls.ts";
import type { Finding, Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface FrozenPathsOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
  /**
   * URL paths whose files are frozen copies kept only for what links them
   * from outside the build, such as `/assets/images`.
   */
  paths: string[];
}

/**
 * No page links, loads or shows a file under a frozen path, including as
 * its Open Graph image. The images under `/assets/images` keep the URLs the
 * old blog feeds embedded, for feed readers that cached those items; pages
 * use the images the build processes.
 */
export function frozenPaths({ origin, paths }: FrozenPathsOptions): Rule {
  const prefixes = paths.map((path) => `${path.replace(/\/$/, "")}/`);
  return {
    name: "frozen-paths",
    check(build) {
      const findings: Finding[] = [];
      for (const file of build.pages()) {
        const document = build.html(file);
        const base = `${origin}${urlPathOf(file)}`;
        const metaUrls = document
          .querySelectorAll("meta[content]")
          .map((meta) => meta.getAttribute("content") ?? "")
          .filter((content) => /^(https?:)?\/\//.test(content));
        for (const url of [...urlsIn(document), ...metaUrls]) {
          let resolved: URL;
          try {
            resolved = new URL(url, base);
          } catch {
            continue;
          }
          const frozen = prefixes.find((prefix) =>
            resolved.pathname.startsWith(prefix),
          );
          if (resolved.origin === origin && frozen !== undefined) {
            findings.push({
              rule: "frozen-paths",
              severity: "error",
              message: `${file} uses ${url}, under the frozen path ${frozen}; pages must not use its files`,
            });
          }
        }
      }
      return findings;
    },
  };
}
