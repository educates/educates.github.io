import { readFileSync } from "node:fs";
import { redirects } from "../../../src/redirects.ts";
import { site } from "../../../src/site.ts";
import { parseMustResolveList } from "../must-resolve-list.ts";
import type { Rule } from "../site-check.ts";
import { canonicalUrls } from "./canonical-urls.ts";
import { mustResolve } from "./must-resolve.ts";
import { redirectPages } from "./redirect-pages.ts";
import { reservedPaths } from "./reserved-paths.ts";
import { sitemap } from "./sitemap.ts";
import { stubPages } from "./stub-pages.ts";

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
    sitemap({ origin: site.origin }),
    redirectPages({ origin: site.origin, redirects }),
    // The Educates Hub moves into the site at /hub; until then it stays empty.
    reservedPaths({ paths: ["/hub"] }),
    // Stub pages warn; `severity: "error"` makes them block the build.
    stubPages({ severity: "warning" }),
  ];
}
