import type { Finding, Rule } from "../site-check.ts";

export interface CanonicalUrlsOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
}

/**
 * Every page has one canonical URL and a matching `og:url`, both the
 * absolute URL the page is served at, without `.html`, `/index` or a
 * trailing slash (docs/adr/0002-keep-the-docusaurus-url-form.md). Redirect
 * pages are skipped: their canonical URL is their target.
 */
export function canonicalUrls({ origin }: CanonicalUrlsOptions): Rule {
  return {
    name: "canonical-urls",
    check(build) {
      const findings: Finding[] = [];
      const fail = (file: string, message: string) =>
        findings.push({
          rule: "canonical-urls",
          severity: "error",
          message: `${file}: ${message}`,
        });

      for (const file of build.pages()) {
        if (file.endsWith("/index.html")) {
          fail(
            file,
            "pages build as <path>.html; GitHub Pages serves <path>/index.html only at a URL with a trailing slash",
          );
          continue;
        }
        const document = build.html(file);
        const links = document.querySelectorAll('link[rel="canonical"]');
        if (links.length === 0) {
          fail(file, "no canonical URL");
          continue;
        }
        if (links.length > 1) {
          fail(file, `${links.length} canonical URLs`);
          continue;
        }
        const canonical = links[0].getAttribute("href") ?? "";
        const problem = urlFormProblem(canonical, origin);
        const served = origin + urlPathOf(file);
        if (problem) {
          fail(file, `canonical URL ${canonical} ${problem}`);
        } else if (canonical !== served) {
          fail(
            file,
            `canonical URL ${canonical} is not the page's own URL; it is served at ${served}`,
          );
        }

        const ogUrl = document
          .querySelector('meta[property="og:url"]')
          ?.getAttribute("content");
        if (ogUrl === undefined) {
          fail(file, "no og:url");
        } else if (ogUrl !== canonical) {
          fail(
            file,
            `og:url ${ogUrl} differs from the canonical URL ${canonical}`,
          );
        }
      }
      return findings;
    },
  };
}

/** What makes `url` break the site's URL form, or `undefined` if nothing. */
function urlFormProblem(url: string, origin: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "is not an absolute URL";
  }
  const { pathname } = parsed;
  if (parsed.origin !== origin) return `is not on ${origin}`;
  if (parsed.search || parsed.hash || url.includes("?") || url.includes("#")) {
    return "has a query or fragment";
  }
  if (pathname.endsWith(".html")) return "ends in .html";
  if (pathname.endsWith("/index")) return "ends in /index";
  if (pathname !== "/" && pathname.endsWith("/")) return "has a trailing slash";
  return undefined;
}

/** The URL path a page file is served at: `index.html` is `/`, `a/b.html` is `/a/b`. */
function urlPathOf(file: string): string {
  if (file === "index.html") return "/";
  return `/${file.replace(/\.html$/, "")}`;
}
