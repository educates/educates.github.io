import { readFileSync } from "node:fs";
import { redirects, staticRedirects } from "../../src/redirects.ts";
import {
  parseMustResolveList,
  type MustResolveEntry,
} from "./must-resolve-list.ts";

/** The URLs the site must keep serving, and where its redirects lead. */
export interface SiteUrls {
  /** The entries of the committed must-resolve list, `must-resolve.txt`. */
  entries: MustResolveEntry[];
  /**
   * Every redirect the site serves, by source: the ones Astro writes and
   * the redirect pages in `public/`.
   */
  redirects: Readonly<Record<string, string>>;
}

/** Reads the committed must-resolve list and the site's redirects. */
export function loadSiteUrls(): SiteUrls {
  return {
    entries: parseMustResolveList(
      readFileSync(new URL("must-resolve.txt", import.meta.url), "utf8"),
    ),
    redirects: { ...redirects, ...staticRedirects },
  };
}
