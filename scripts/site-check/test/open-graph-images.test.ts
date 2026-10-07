import { describe, expect, it } from "vitest";
import { openGraphImages } from "../rules/open-graph-images.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";
const png = "\x89PNG";

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild(files), [openGraphImages({ origin })]);
}

/** The Open Graph image tags the base layout writes, for `url`. */
function imageTags(url: string, width = "1200", height = "630"): string {
  return `<meta property="og:image" content="${url}"><meta property="og:image:width" content="${width}"><meta property="og:image:height" content="${height}">`;
}

describe("open-graph-images rule", () => {
  it("passes pages whose og:image is a file in the build, with its width and height", () => {
    const findings = check({
      "index.html": page(`${origin}/`, imageTags(`${origin}/og/index.png`)),
      "blog/a-post.html": page(
        `${origin}/blog/a-post`,
        imageTags(`${origin}/_astro/cover.Bx1.png`),
      ),
      "og/index.png": png,
      "_astro/cover.Bx1.png": png,
    });
    expect(findings).toEqual([]);
  });

  it("skips redirect pages", () => {
    expect(check({ "team.html": redirectPage("/community") })).toEqual([]);
  });

  it("fails a page whose og:image file is missing from the build", () => {
    const findings = check({
      "downloads.html": page(
        `${origin}/downloads`,
        imageTags(`${origin}/og/downloads.png`),
      ),
    });
    expect(findings).toMatchObject([
      { rule: "open-graph-images", severity: "error" },
    ]);
    expect(findings[0].message).toMatch(
      /downloads\.html: .*\/og\/downloads\.png.* missing from the build/,
    );
  });

  it.each([
    ["no og:image", page(`${origin}/downloads`), /no og:image/],
    [
      "a relative og:image",
      page(`${origin}/downloads`, imageTags("/og/downloads.png")),
      /not an absolute URL on https:\/\/educates\.dev/,
    ],
    [
      "an og:image on another site",
      page(
        `${origin}/downloads`,
        imageTags("https://opengraph.githubassets.com/1/educates/x"),
      ),
      /not an absolute URL on https:\/\/educates\.dev/,
    ],
    [
      "the old social card as its og:image",
      page(
        `${origin}/downloads`,
        imageTags(`${origin}/img/educates-social-card.png`),
      ),
      /educates-social-card\.png/,
    ],
    [
      "no og:image:width",
      page(
        `${origin}/downloads`,
        `<meta property="og:image" content="${origin}/og/downloads.png"><meta property="og:image:height" content="630">`,
      ),
      /og:image:width/,
    ],
    [
      "no og:image:height",
      page(
        `${origin}/downloads`,
        `<meta property="og:image" content="${origin}/og/downloads.png"><meta property="og:image:width" content="1200">`,
      ),
      /og:image:height/,
    ],
  ])("fails a page with %s", (_, html, message) => {
    const findings = check({
      "downloads.html": html,
      "og/downloads.png": png,
      "img/educates-social-card.png": png,
    });
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toMatchObject({
      rule: "open-graph-images",
      severity: "error",
    });
    expect(findings.map((finding) => finding.message).join("\n")).toMatch(
      message,
    );
    expect(findings[0].message).toContain("downloads.html");
  });
});
