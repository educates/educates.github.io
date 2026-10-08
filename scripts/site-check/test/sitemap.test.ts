import { describe, expect, it } from "vitest";
import { sitemap } from "../rules/sitemap.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

function sitemapXml(...urls: string[]): string {
  const entries = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}

const pages = {
  "index.html": page(`${origin}/`),
  "downloads.html": page(`${origin}/downloads`),
  "404.html": page(`${origin}/404`),
  "team.html": redirectPage("/community"),
};

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild({ ...pages, ...files }), [sitemap({ origin })]);
}

describe("sitemap rule", () => {
  it("passes one /sitemap.xml that lists pages", () => {
    const findings = check({
      "sitemap.xml": sitemapXml(`${origin}/`, `${origin}/downloads`),
    });
    expect(findings).toEqual([]);
  });

  it("fails a build without /sitemap.xml", () => {
    const findings = check({});
    expect(findings).toMatchObject([{ rule: "sitemap", severity: "error" }]);
    expect(findings[0].message).toMatch(/no sitemap\.xml/);
  });

  it.each([["sitemap-index.xml"], ["sitemap-0.xml"], ["sitemap-1.xml"]])(
    "fails a build that also has %s",
    (extra) => {
      const findings = check({
        "sitemap.xml": sitemapXml(`${origin}/`),
        [extra]: sitemapXml(`${origin}/`),
      });
      expect(findings).toMatchObject([{ rule: "sitemap", severity: "error" }]);
      expect(findings[0].message).toContain(extra);
    },
  );

  it.each([
    ["a redirect page", `${origin}/team`, /redirect page/],
    ["the 404 page", `${origin}/404`, /404 page/],
    ["a URL the build does not serve", `${origin}/missing`, /not served/],
    ["a URL with .html", `${origin}/downloads.html`, /\.html/],
    ["a URL on another origin", "https://docs.educates.dev/", /not on/],
  ])("fails a sitemap listing %s", (_, url, message) => {
    const findings = check({ "sitemap.xml": sitemapXml(`${origin}/`, url) });
    expect(findings).toMatchObject([{ rule: "sitemap", severity: "error" }]);
    expect(findings[0].message).toContain(url);
    expect(findings[0].message).toMatch(message);
  });
});
