import { readFileSync } from "node:fs";
import { homepageAnchorForwards } from "../../../src/lib/anchor-forwards.ts";
import { redirects, staticRedirects } from "../../../src/redirects.ts";
import { site } from "../../../src/site.ts";
import { parseMustResolveList } from "../must-resolve-list.ts";
import type { Rule } from "../site-check.ts";
import { canonicalUrls } from "./canonical-urls.ts";
import { educates4OnlyTerms } from "./educates4-only-terms.ts";
import { feedIdentity } from "./feed-identity.ts";
import { feedLinks } from "./feed-links.ts";
import { frozenPaths } from "./frozen-paths.ts";
import { keptAnchors } from "./kept-anchors.ts";
import { mustResolve } from "./must-resolve.ts";
import { openGraphImages } from "./open-graph-images.ts";
import { redirectPages } from "./redirect-pages.ts";
import { reservedPaths } from "./reserved-paths.ts";
import { sitemap } from "./sitemap.ts";
import { stubPages } from "./stub-pages.ts";

/** The old homepage's anchors whose sections the homepage keeps, by id. */
const homepageAnchors = [
  "use-cases",
  "description",
  "features",
  "featured-content",
  "pricing",
];

/**
 * The rules the site-check command runs over every build. A rule is a
 * function in this folder that returns a `Rule`; add it here to run it,
 * and test it against small fixture builds in `../test/`.
 */
export function siteRules(): Rule[] {
  const mustResolveList = parseMustResolveList(
    readFileSync(new URL("../must-resolve.txt", import.meta.url), "utf8"),
  );
  return [
    // Missing entries warn; `missing: "error"` makes them block the build.
    mustResolve(mustResolveList, { missing: "warning" }),
    canonicalUrls({ origin: site.origin }),
    openGraphImages({ origin: site.origin }),
    sitemap({ origin: site.origin }),
    redirectPages({
      origin: site.origin,
      redirects: { ...redirects, ...staticRedirects },
    }),
    // The old homepage's anchors: the sections the homepage keeps, and the
    // places its inline script forwards the others to.
    keptAnchors({
      anchors: [
        ...homepageAnchors.map((id) => `/#${id}`),
        ...Object.values(homepageAnchorForwards),
      ],
    }),
    // The Educates Hub moves into the site at /hub; until then it stays empty.
    reservedPaths({ paths: ["/hub"] }),
    feedIdentity({ origin: site.origin, blogPath: "/blog" }),
    feedLinks({
      origin: site.origin,
      feeds: ["/blog/rss.xml", "/blog/atom.xml"],
    }),
    // The images the old feeds embedded, kept at their URLs for feed readers
    // that cached those items.
    frozenPaths({ origin: site.origin, paths: ["/assets/images"] }),
    // Stub pages warn; `severity: "error"` makes them block the build.
    stubPages({ severity: "warning" }),
    // The use case pages say "air-gapped" only once Educates 4.0 is released.
    educates4OnlyTerms({
      educates4Released: site.educates4Released,
      paths: ["/use-cases"],
      terms: [/air[\s-]?gapped/i],
    }),
  ];
}
