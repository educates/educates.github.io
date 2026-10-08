import { describe, expect, it } from "vitest";
import { fetchLiveSitemap } from "../live-sitemap.ts";
import { liveSitemap } from "../rules/live-sitemap.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const sitemapUrl = "https://educates.dev/sitemap.xml";

function sitemapXml(...urls: string[]): string {
  const entries = urls
    .map((url) => `<url><loc>${url}</loc><changefreq>weekly</changefreq></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}

/** A fetch that answers every request with `response`, and records URLs. */
function answering(response: () => Response) {
  const requested: string[] = [];
  const fetchUrl = async (input: string | URL | Request) => {
    requested.push(String(input));
    return response();
  };
  return { fetchUrl, requested };
}

describe("fetching the live sitemap", () => {
  it("reads the URLs the live sitemap lists", async () => {
    const { fetchUrl, requested } = answering(
      () =>
        new Response(
          sitemapXml("https://educates.dev/", "https://educates.dev/blog"),
        ),
    );
    const sitemap = await fetchLiveSitemap(sitemapUrl, fetchUrl);
    expect(requested).toEqual([sitemapUrl]);
    expect(sitemap).toEqual({
      url: sitemapUrl,
      urls: ["https://educates.dev/", "https://educates.dev/blog"],
    });
  });

  it("says why when the request fails", async () => {
    const fetchUrl = async () => {
      throw new TypeError("fetch failed", {
        cause: new Error("getaddrinfo ENOTFOUND educates.dev"),
      });
    };
    const sitemap = await fetchLiveSitemap(sitemapUrl, fetchUrl);
    expect(sitemap).toEqual({
      url: sitemapUrl,
      unavailable: "fetch failed: getaddrinfo ENOTFOUND educates.dev",
    });
  });

  it("says why when the server answers with an error", async () => {
    const { fetchUrl } = answering(
      () => new Response("Service Unavailable", { status: 503 }),
    );
    const sitemap = await fetchLiveSitemap(sitemapUrl, fetchUrl);
    expect(sitemap).toEqual({
      url: sitemapUrl,
      unavailable: "the server answered 503",
    });
  });

  it("says why when the answer is not a sitemap", async () => {
    const { fetchUrl } = answering(
      () => new Response("<!doctype html><title>Captive portal</title>"),
    );
    const sitemap = await fetchLiveSitemap(sitemapUrl, fetchUrl);
    expect(sitemap).toEqual({
      url: sitemapUrl,
      unavailable: "the answer is not a sitemap",
    });
  });

  it("gives up on a server that does not answer in time", async () => {
    const fetchUrl = (_: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(init.signal?.reason),
        );
      });
    const sitemap = await fetchLiveSitemap(sitemapUrl, fetchUrl, {
      timeoutMs: 10,
    });
    expect(sitemap).toMatchObject({
      url: sitemapUrl,
      unavailable: expect.stringMatching(/timed out|aborted/i),
    });
  });
});

describe("live-sitemap rule", () => {
  const built = {
    "index.html": page("https://educates.dev/"),
    "blog.html": page("https://educates.dev/blog"),
    "blog/getting-started-on-kind.html": page(
      "https://educates.dev/blog/getting-started-on-kind",
    ),
    "about-educates/deployment.html": redirectPage("/about-educates"),
    "about-educates.html": page("https://educates.dev/about-educates"),
  };

  it("passes when the build serves every live URL, as a page or a redirect page", () => {
    const findings = checkSite(fixtureBuild(built), [
      liveSitemap({
        url: sitemapUrl,
        urls: [
          "https://educates.dev/",
          "https://educates.dev/blog",
          "https://educates.dev/about-educates/deployment",
        ],
      }),
    ]);
    expect(findings).toEqual([]);
  });

  it("fails each live URL the build does not serve, such as a post published since the conversion", () => {
    const findings = checkSite(fixtureBuild(built), [
      liveSitemap({
        url: sitemapUrl,
        urls: [
          "https://educates.dev/blog",
          "https://educates.dev/blog/a-post-published-since",
          "https://educates.dev/blog/page/3",
        ],
      }),
    ]);
    expect(findings).toEqual([
      {
        rule: "live-sitemap",
        severity: "error",
        message:
          "https://educates.dev/blog/a-post-published-since is in the live sitemap but not served by the build",
      },
      {
        rule: "live-sitemap",
        severity: "error",
        message:
          "https://educates.dev/blog/page/3 is in the live sitemap but not served by the build",
      },
    ]);
  });

  it("skips the comparison with a warning when the live sitemap could not be fetched", () => {
    const findings = checkSite(fixtureBuild(built), [
      liveSitemap({
        url: sitemapUrl,
        unavailable: "fetch failed: getaddrinfo ENOTFOUND educates.dev",
      }),
    ]);
    expect(findings).toEqual([
      {
        rule: "live-sitemap",
        severity: "warning",
        message:
          "skipped: could not fetch https://educates.dev/sitemap.xml (fetch failed: getaddrinfo ENOTFOUND educates.dev)",
      },
    ]);
  });
});
