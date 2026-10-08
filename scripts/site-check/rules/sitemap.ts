import { isRedirectPage, type Finding, type Rule } from "../site-check.ts";
import { urlFormProblem } from "../url-form.ts";

export interface SitemapOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
}

/**
 * `/sitemap.xml` is one file, with no sitemap index or numbered parts, and
 * lists pages only: each URL in the site's URL form and served by the build
 * as a page, never a redirect page or the 404 page.
 */
export function sitemap({ origin }: SitemapOptions): Rule {
  return {
    name: "sitemap",
    check(build) {
      const findings: Finding[] = [];
      const fail = (message: string) =>
        findings.push({ rule: "sitemap", severity: "error", message });

      for (const file of build.files) {
        if (/^sitemap-(index|\d+)\.xml$/.test(file)) {
          fail(`${file}: the sitemap must be one file, /sitemap.xml`);
        }
      }
      if (!build.files.has("sitemap.xml")) {
        fail("no sitemap.xml in the build");
        return findings;
      }

      const locs = [
        ...build.read("sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g),
      ];
      for (const [, url] of locs) {
        const listed = `sitemap.xml lists ${url}`;
        const problem = urlFormProblem(url, origin);
        if (problem) {
          fail(`${listed}, which ${problem}`);
          continue;
        }
        const file = build.resolve(new URL(url).pathname);
        if (file === undefined) {
          fail(`${listed}, which is not served by the build`);
        } else if (file === "404.html") {
          fail(`${listed}, the 404 page`);
        } else if (!file.endsWith(".html")) {
          fail(`${listed}, which is a file, not a page`);
        } else if (isRedirectPage(build.html(file))) {
          fail(`${listed}, a redirect page`);
        }
      }
      return findings;
    },
  };
}
