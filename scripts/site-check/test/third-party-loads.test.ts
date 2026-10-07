import { describe, expect, it } from "vitest";
import { thirdPartyLoads } from "../rules/third-party-loads.ts";
import { checkSite } from "../site-check.ts";
import {
  atomEntry,
  atomFeed,
  fixtureBuild,
  page,
  redirectPage,
  rssFeed,
  rssItem,
} from "./fixture-build.ts";

const origin = "https://educates.dev";
const post = `${origin}/blog/first-post`;

/** A page at `path` whose body holds `html`. */
function pageWith(path: string, html: string, head = ""): string {
  return page(`${origin}${path}`, head).replace(
    "<h1>Page</h1>",
    `<h1>Page</h1>${html}`,
  );
}

function check(files: Record<string, string>) {
  return checkSite(
    fixtureBuild({ "index.html": page(`${origin}/`), ...files }),
    [
      thirdPartyLoads({
        origin,
        allowedOrigins: ["https://gc.zgo.at"],
        feeds: ["/blog/rss.xml", "/blog/atom.xml"],
      }),
    ],
  );
}

describe("third-party-loads rule", () => {
  it("passes pages that load everything from the site, and link anywhere", () => {
    const html = [
      '<img src="/_astro/jorge.webp" srcset="/_astro/jorge.webp 1x, /_astro/jorge@2x.webp 2x" alt="">',
      `<img src="${origin}/img/logo.svg" alt="">`,
      '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="">',
      '<script type="module" src="/_astro/page.js"></script>',
      '<video src="/_astro/loop.mp4" poster="/_astro/loop.webp"></video>',
      '<div style="background: url(/_astro/dots.svg)"></div>',
      '<a href="https://github.com/educates">GitHub</a>',
      '<a href="https://www.youtube.com/watch?v=abc"><img src="/_astro/poster.webp" alt=""></a>',
    ].join("");
    const head = [
      '<link rel="stylesheet" href="/_astro/site.css">',
      '<link rel="icon" href="/img/favicon.ico">',
      '<link rel="alternate" type="application/rss+xml" href="https://educates.dev/blog/rss.xml">',
      '<link rel="preconnect" href="https://www.youtube-nocookie.com">',
      '<style>.cover { background-image: url("/_astro/cover.png"); }</style>',
      '<script src="https://gc.zgo.at/count.js" async></script>',
    ].join("");
    expect(check({ "learn.html": pageWith("/learn", html, head) })).toEqual([]);
  });

  it.each([
    ["a picture", '<img src="https://github.com/jorgemoralespou.png" alt="">'],
    [
      "a picture candidate",
      '<img src="/_astro/a.webp" srcset="/_astro/a.webp 1x, https://cdn.example.com/a@2x.webp 2x" alt="">',
    ],
    [
      "a source of a picture",
      '<picture><source srcset="https://cdn.example.com/a.avif" type="image/avif"><img src="/a.png" alt=""></picture>',
    ],
    ["a script", '<script src="https://cdn.example.com/lib.js"></script>'],
    ["a frame", '<iframe src="https://www.youtube.com/embed/abc"></iframe>'],
    ["a video", '<video src="https://cdn.example.com/loop.mp4"></video>'],
    [
      "a video poster",
      '<video src="/loop.mp4" poster="https://i.ytimg.com/vi/abc/hqdefault.jpg"></video>',
    ],
    ["a sound", '<audio src="https://cdn.example.com/beep.mp3"></audio>'],
    [
      "a URL in an inline style",
      "<div style=\"background: url('https://cdn.example.com/dots.svg')\"></div>",
    ],
    [
      "a URL in a style element",
      "<style>.a { background: url(https://cdn.example.com/dots.svg) }</style>",
    ],
    ["a protocol-relative URL", '<img src="//cdn.example.com/a.png" alt="">'],
  ])("fails a page that loads %s from another site", (_, html) => {
    const findings = check({ "learn.html": pageWith("/learn", html) });
    expect(findings).toMatchObject([
      { rule: "third-party-loads", severity: "error" },
    ]);
    expect(findings[0].message).toContain("/learn (learn.html)");
  });

  it.each([
    [
      "a stylesheet",
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest">',
    ],
    ["an icon", '<link rel="icon" href="https://cdn.example.com/favicon.ico">'],
    [
      "a touch icon",
      '<link rel="apple-touch-icon" href="https://cdn.example.com/touch.png">',
    ],
  ])("fails a page whose head loads %s from another site", (_, head) => {
    const findings = check({ "learn.html": pageWith("/learn", "", head) });
    expect(findings).toMatchObject([
      { rule: "third-party-loads", severity: "error" },
    ]);
  });

  it("names the page, the URL and what loads it", () => {
    expect(
      check({
        "blog/first-post.html": pageWith(
          "/blog/first-post",
          '<img src="https://github.com/jorgemoralespou.png" alt="">',
        ),
      }),
    ).toEqual([
      {
        rule: "third-party-loads",
        severity: "error",
        message:
          "/blog/first-post (blog/first-post.html) loads https://github.com/jorgemoralespou.png from another site, in <img src>",
      },
    ]);
  });

  it("leaves redirect pages alone", () => {
    expect(
      check({ "team.html": redirectPage("https://docs.educates.dev") }),
    ).toEqual([]);
  });

  describe.each([
    [
      "RSS",
      (content: string) => ({
        "blog/rss.xml": rssFeed(rssItem({ link: post, content })),
      }),
      "blog/rss.xml",
    ],
    [
      "Atom",
      (content: string) => ({
        "blog/atom.xml": atomFeed({}, atomEntry({ link: post, content })),
      }),
      "blog/atom.xml",
    ],
  ])("in the %s feed", (_, feed, file) => {
    it("passes items that load everything from the site, and link anywhere", () => {
      expect(
        check(
          feed(
            `<p><a href="https://github.com/educates">GitHub</a></p><img src="${origin}/_astro/arch.webp" alt="">`,
          ),
        ),
      ).toEqual([]);
    });

    it("fails an item that loads a picture from another site, naming the item", () => {
      expect(
        check(feed('<img src="https://cdn.example.com/arch.png" alt="">')),
      ).toEqual([
        {
          rule: "third-party-loads",
          severity: "error",
          message: `${file}: the item for ${post} loads https://cdn.example.com/arch.png from another site, in <img src>`,
        },
      ]);
    });
  });
});
