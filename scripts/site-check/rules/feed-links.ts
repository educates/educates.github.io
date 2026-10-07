import { parse } from "node-html-parser";
import { atomFeed, rssItems } from "../feed-xml.ts";
import type { Finding, Rule } from "../site-check.ts";

export interface FeedLinksOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
  /** The URL paths of the RSS and Atom feeds, such as `/blog/rss.xml`. */
  feeds: string[];
}

/**
 * A feed reader shows a post away from the site, so every link and image
 * in a feed item's HTML is an absolute URL, and one on the site is served
 * by the build. A feed missing from the build is the must-resolve list's
 * to report.
 */
export function feedLinks({ origin, feeds }: FeedLinksOptions): Rule {
  return {
    name: "feed-links",
    check(build) {
      const findings: Finding[] = [];
      for (const feed of feeds) {
        const file = build.resolve(feed);
        if (file === undefined) continue;
        const xml = build.read(file);
        const items = /<rss[\s>]/.test(xml)
          ? rssItems(xml)
          : atomFeed(xml).entries;
        for (const { link, content } of items) {
          for (const url of urlsIn(content ?? "")) {
            const problem = urlProblem(url);
            if (problem) {
              findings.push({
                rule: "feed-links",
                severity: "error",
                message: `${file}: the item for ${link} uses ${url}, which ${problem}`,
              });
            }
          }
        }
      }
      return findings;

      function urlProblem(url: string): string | undefined {
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          return "is not an absolute URL";
        }
        if (
          parsed.origin === origin &&
          build.resolve(decodeURI(parsed.pathname)) === undefined
        ) {
          return "the build does not serve";
        }
        return undefined;
      }
    },
  };
}

/** Every link, image and media URL in a piece of HTML, in order. */
function urlsIn(html: string): string[] {
  const document = parse(html);
  const urls: string[] = [];
  for (const element of document.querySelectorAll(
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
