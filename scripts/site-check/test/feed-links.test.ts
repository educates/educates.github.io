import { describe, expect, it } from "vitest";
import { feedLinks } from "../rules/feed-links.ts";
import { checkSite } from "../site-check.ts";
import {
  atomEntry,
  atomFeed,
  fixtureBuild,
  page,
  rssFeed,
  rssItem,
} from "./fixture-build.ts";

const origin = "https://educates.dev";
const post = `${origin}/blog/first-post`;

const served = {
  "blog/first-post.html": page(post),
  "blog/second-post.html": page(`${origin}/blog/second-post`),
  "_astro/arch.Bx1.webp": "image",
  "_astro/arch.Bx2.webp": "image",
};

const feeds = {
  RSS: (content: string) => ({
    "blog/rss.xml": rssFeed(rssItem({ link: post, content })),
  }),
  Atom: (content: string) => ({
    "blog/atom.xml": atomFeed({}, atomEntry({ link: post, content })),
  }),
};

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild({ ...served, ...files }), [
    feedLinks({ origin, feeds: ["/blog/rss.xml", "/blog/atom.xml"] }),
  ]);
}

describe.each(Object.entries(feeds))(
  "feed-links rule, in the %s feed",
  (_, feed) => {
    it("passes posts whose links and images are absolute URLs the build serves or URLs elsewhere", () => {
      const content = [
        `<p><a href="${origin}/blog/second-post">Next</a>`,
        `<a href="${origin}/blog/second-post#setup">Setup</a>`,
        `<a href="${post}#intro">Intro</a>`,
        `<a href="https://docs.educates.dev/">Docs</a>`,
        `<a href="mailto:team@educates.dev">Mail</a></p>`,
        `<img src="${origin}/_astro/arch.Bx1.webp" srcset="${origin}/_astro/arch.Bx1.webp 1x, ${origin}/_astro/arch.Bx2.webp 2x" alt="">`,
        `<img src="https://img.youtube.com/vi/x/hqdefault.jpg" alt="">`,
      ].join("");
      expect(check(feed(content))).toEqual([]);
    });

    it.each([
      [
        "a link by path",
        `<a href="/blog/second-post">Next</a>`,
        "/blog/second-post",
      ],
      ["a link to a fragment", `<a href="#intro">Intro</a>`, "#intro"],
      [
        "an image by path",
        `<img src="/_astro/arch.Bx1.webp" alt="">`,
        "/_astro/arch.Bx1.webp",
      ],
      [
        "an image candidate by path",
        `<img src="${origin}/_astro/arch.Bx1.webp" srcset="/_astro/arch.Bx2.webp 2x" alt="">`,
        "/_astro/arch.Bx2.webp",
      ],
    ])("fails %s", (_, content, url) => {
      const findings = check(feed(content));
      expect(findings).toMatchObject([
        { rule: "feed-links", severity: "error" },
      ]);
      expect(findings[0].message).toContain(post);
      expect(findings[0].message).toContain(
        `${url}, which is not an absolute URL`,
      );
    });

    it.each([
      [
        "a link",
        `<a href="${origin}/blog/third-post">Gone</a>`,
        `${origin}/blog/third-post`,
      ],
      [
        "an image",
        `<img src="${origin}/_astro/gone.webp" alt="">`,
        `${origin}/_astro/gone.webp`,
      ],
    ])(
      "fails %s on the site that the build does not serve",
      (_, content, url) => {
        const findings = check(feed(content));
        expect(findings).toMatchObject([
          { rule: "feed-links", severity: "error" },
        ]);
        expect(findings[0].message).toContain(post);
        expect(findings[0].message).toContain(
          `${url}, which the build does not serve`,
        );
      },
    );
  },
);
