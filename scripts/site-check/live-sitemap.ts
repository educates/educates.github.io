/**
 * The live site's sitemap as the site check fetched it: the URLs it lists,
 * or why they could not be read.
 */
export type LiveSitemap =
  { url: string; urls: string[] } | { url: string; unavailable: string };

/** The `fetch` the site check uses, replaceable in tests. */
export type FetchUrl = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface FetchLiveSitemapOptions {
  /** How long to wait for the whole answer before giving up. */
  timeoutMs?: number;
}

/**
 * Fetches the sitemap at `url` and reads the URLs it lists. Never throws: a
 * failed request, an error status, an answer that is not a sitemap or a
 * server too slow to answer makes the sitemap unavailable, with the reason.
 */
export async function fetchLiveSitemap(
  url: string,
  fetchUrl: FetchUrl = fetch,
  { timeoutMs = 15_000 }: FetchLiveSitemapOptions = {},
): Promise<LiveSitemap> {
  try {
    const response = await fetchUrl(url, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      await response.body?.cancel();
      return { url, unavailable: `the server answered ${response.status}` };
    }
    const text = await response.text();
    if (!/<urlset[\s>]/.test(text)) {
      return { url, unavailable: "the answer is not a sitemap" };
    }
    const urls = [...text.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map(
      ([, loc]) => loc,
    );
    return { url, urls };
  } catch (error) {
    return { url, unavailable: reason(error) };
  }
}

/** An error's message, followed by its cause's, as Node's fetch nests them. */
function reason(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  return error.cause instanceof Error
    ? `${error.message}: ${error.cause.message}`
    : error.message;
}
