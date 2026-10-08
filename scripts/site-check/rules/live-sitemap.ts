import type { LiveSitemap } from "../live-sitemap.ts";
import type { Rule } from "../site-check.ts";

/**
 * Every URL the live site's sitemap lists is served by the build, as a page,
 * a file or a redirect page, so a page published on the live site since the
 * build last matched it, such as a new blog post, is not lost. When the live
 * sitemap could not be fetched, the comparison is skipped with a warning.
 */
export function liveSitemap(sitemap: LiveSitemap): Rule {
  return {
    name: "live-sitemap",
    check(build) {
      if ("unavailable" in sitemap) {
        return [
          {
            rule: "live-sitemap",
            severity: "warning",
            message: `skipped: could not fetch ${sitemap.url} (${sitemap.unavailable})`,
          },
        ];
      }
      return sitemap.urls
        .filter((url) => build.resolve(pathOf(url)) === undefined)
        .map((url) => ({
          rule: "live-sitemap",
          severity: "error",
          message: `${url} is in the live sitemap but not served by the build`,
        }));
    },
  };
}

function pathOf(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname);
  } catch {
    return url;
  }
}
