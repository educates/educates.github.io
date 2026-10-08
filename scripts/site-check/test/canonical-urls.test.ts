import { describe, expect, it } from "vitest";
import { canonicalUrls } from "../rules/canonical-urls.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild(files), [canonicalUrls({ origin })]);
}

/** A page whose head has exactly the tags given. */
function pageWithHead(head: string): string {
  return `<!doctype html><html lang="en"><head><title>Page</title>${head}</head><body><main><h1>Page</h1></main></body></html>`;
}

describe("canonical-urls rule", () => {
  it("passes pages whose canonical URL and og:url are their own clean URL", () => {
    const findings = check({
      "index.html": page("https://educates.dev/"),
      "downloads.html": page("https://educates.dev/downloads"),
      "blog/page/2.html": page("https://educates.dev/blog/page/2"),
      "404.html": page("https://educates.dev/404"),
    });
    expect(findings).toEqual([]);
  });

  it("skips redirect pages, whose canonical URL is their target", () => {
    const findings = check({
      "team.html": redirectPage("/community"),
      "posts/index.html": redirectPage("/blog"),
    });
    expect(findings).toEqual([]);
  });

  it("ignores files that are not HTML pages", () => {
    const findings = check({ "robots.txt": "User-agent: *" });
    expect(findings).toEqual([]);
  });

  it.each([
    ["no canonical URL", pageWithHead(""), /no canonical URL/],
    [
      "two canonical URLs",
      pageWithHead(
        `<link rel="canonical" href="${origin}/about"><link rel="canonical" href="${origin}/about">`,
      ),
      /2 canonical URLs/,
    ],
    ["a canonical URL ending in .html", page(`${origin}/about.html`), /\.html/],
    [
      "a canonical URL ending in /index",
      page(`${origin}/about/index`),
      /\/index/,
    ],
    [
      "a canonical URL with a trailing slash",
      page(`${origin}/about/`),
      /trailing slash/,
    ],
    ["a relative canonical URL", page("/about"), /not an absolute URL/],
    [
      "a canonical URL on http",
      page("http://educates.dev/about"),
      /https:\/\/educates\.dev/,
    ],
    [
      "a canonical URL on www",
      page("https://www.educates.dev/about"),
      /https:\/\/educates\.dev/,
    ],
    [
      "a canonical URL with a query",
      page(`${origin}/about?x=1`),
      /query or fragment/,
    ],
    [
      "a canonical URL for another page",
      page(`${origin}/blog`),
      /served at https:\/\/educates\.dev\/about/,
    ],
    [
      "no og:url",
      pageWithHead(`<link rel="canonical" href="${origin}/about">`),
      /og:url/,
    ],
    [
      "an og:url that differs from the canonical URL",
      pageWithHead(
        `<link rel="canonical" href="${origin}/about"><meta property="og:url" content="${origin}/about.html">`,
      ),
      /og:url/,
    ],
  ])("fails a page with %s", (_, html, message) => {
    const findings = check({ "about.html": html });
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: "canonical-urls",
      severity: "error",
    });
    expect(findings.map((finding) => finding.message).join("\n")).toMatch(
      message,
    );
    expect(findings[0].message).toContain("about.html");
  });

  it("fails a page built as <path>/index.html, which GitHub Pages serves only with a trailing slash", () => {
    const findings = check({
      "about/index.html": page(`${origin}/about`),
    });
    expect(findings).toMatchObject([
      { rule: "canonical-urls", severity: "error" },
    ]);
    expect(findings[0].message).toMatch(/about\/index\.html.*<path>\.html/);
  });
});
