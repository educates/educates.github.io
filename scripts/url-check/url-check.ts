import { parse } from "node-html-parser";
import { errorReason, type FetchUrl } from "../site-check/fetch-url.ts";
import { metaRefresh } from "../site-check/meta-refresh.ts";
import type { MustResolveEntry } from "../site-check/must-resolve-list.ts";
import { isRedirectPage } from "../site-check/site-check.ts";

/** What a served site answered for one entry of the must-resolve list. */
export interface UrlCheckResult {
  path: string;
  section: string;
  ok: boolean;
  message: string;
}

export interface CheckServedUrlsOptions {
  /** Where the site is served, such as `https://educates.dev`. */
  baseUrl: string;
  /** The URL paths the site must serve. */
  entries: MustResolveEntry[];
  /** The site's redirects, from a URL path to its target path or URL. */
  redirects: Readonly<Record<string, string>>;
  fetchUrl?: FetchUrl;
  /** How many requests run at once. */
  concurrency?: number;
  /** How long to wait for one answer before giving up. */
  timeoutMs?: number;
}

/**
 * Requests every entry of the must-resolve list from the site served at
 * `baseUrl`, as a visitor would after a deploy, and reports each one in
 * list order. A page or file must answer 200 itself, without an HTTP
 * redirect. A redirect source must answer 200 with a redirect page whose
 * meta refresh names its configured target, and that target must answer
 * 200; an outside target may reach it through its own HTTP redirects.
 */
export async function checkServedUrls({
  baseUrl,
  entries,
  redirects,
  fetchUrl = fetch,
  concurrency = 8,
  timeoutMs = 30_000,
}: CheckServedUrlsOptions): Promise<UrlCheckResult[]> {
  const request = (url: URL, redirect: RequestRedirect) =>
    fetchUrl(url, { redirect, signal: AbortSignal.timeout(timeoutMs) });

  const checkEntry = async ({
    path,
    section,
  }: MustResolveEntry): Promise<UrlCheckResult> => {
    const result = (ok: boolean, message: string) => ({
      path,
      section,
      ok,
      message,
    });
    const target = redirects[path];
    try {
      const url = new URL(path, baseUrl);
      const response = await request(url, "manual");
      if (target === undefined) {
        await response.body?.cancel();
        return response.status === 200
          ? result(true, "200")
          : result(false, `${answered(response)}, not 200`);
      }

      if (response.status !== 200) {
        await response.body?.cancel();
        return result(
          false,
          `${answered(response)}; it must be a redirect page to ${target}`,
        );
      }
      const document = parse(await response.text());
      if (!isRedirectPage(document)) {
        return result(
          false,
          `is a page, not a redirect page; it must redirect to ${target}`,
        );
      }
      const actual = metaRefresh(document).target;
      if (actual === undefined) {
        return result(
          false,
          `its meta refresh names no target; it must redirect to ${target}`,
        );
      }
      const expected = new URL(target, baseUrl);
      if (new URL(actual, url).href !== expected.href) {
        return result(false, `redirects to ${actual}, not to ${target}`);
      }
      const outside = expected.origin !== new URL(baseUrl).origin;
      const landing = await request(expected, outside ? "follow" : "manual");
      await landing.body?.cancel();
      return result(
        landing.status === 200,
        `redirects to ${target}, which ${answered(landing)}`,
      );
    } catch (error) {
      return result(false, `could not be fetched: ${errorReason(error)}`);
    }
  };

  const results: UrlCheckResult[] = new Array(entries.length);
  let next = 0;
  const worker = async () => {
    while (next < entries.length) {
      const index = next++;
      results[index] = await checkEntry(entries[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, entries.length) }, worker),
  );
  return results;
}

/** A response's status, with where an HTTP redirect points. */
function answered(response: Response): string {
  const location = response.headers.get("location");
  return location === null || response.status < 300 || response.status >= 400
    ? `answered ${response.status}`
    : `answered ${response.status} to ${location}`;
}
