import { describe, expect, it } from "vitest";
import { feedIdentity } from "../rules/feed-identity.ts";
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
const first = `${origin}/blog/first-post`;
const second = `${origin}/blog/second-post`;

/** Two posts, and both feeds listing them with their post URLs as identity. */
const wellFormed = {
  "blog.html": page(`${origin}/blog`),
  "blog/first-post.html": page(first),
  "blog/second-post.html": page(second),
  "blog/rss.xml": rssFeed(rssItem({ link: first }), rssItem({ link: second })),
  "blog/atom.xml": atomFeed(
    {},
    atomEntry({ link: first }),
    atomEntry({ link: second }),
  ),
};

function check(files: Record<string, string | undefined>) {
  const build = Object.fromEntries(
    Object.entries({ ...wellFormed, ...files }).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  return checkSite(fixtureBuild(build), [
    feedIdentity({ origin, blogPath: "/blog" }),
  ]);
}

describe("feed-identity rule", () => {
  it("passes feeds whose every item is identified by its post URL", () => {
    expect(check({})).toEqual([]);
  });

  it("leaves a feed the build lacks to the must-resolve list", () => {
    expect(
      check({ "blog/rss.xml": undefined, "blog/atom.xml": undefined }),
    ).toEqual([]);
  });

  it.each([
    [
      "a guid that is not a permalink",
      rssItem({
        link: second,
        guid: `<guid isPermaLink="false">${second}</guid>`,
      }),
      /isPermaLink="true"/,
    ],
    [
      "a guid without isPermaLink",
      rssItem({ link: second, guid: `<guid>${second}</guid>` }),
      /isPermaLink="true"/,
    ],
    ["no guid", rssItem({ link: second, guid: "" }), /no guid/],
    [
      "a guid other than its link",
      rssItem({
        link: second,
        guid: `<guid isPermaLink="true">${first}</guid>`,
      }),
      /guid .*first-post is not its link .*second-post/,
    ],
    [
      "a guid with a trailing slash",
      rssItem({ link: `${second}/` }),
      /second-post\/ .*trailing slash/,
    ],
    [
      "a guid ending in .html",
      rssItem({ link: `${second}.html` }),
      /second-post\.html .*\.html/,
    ],
    [
      "a guid on another origin",
      rssItem({ link: "https://www.educates.dev/blog/second-post" }),
      /not on https:\/\/educates\.dev/,
    ],
    [
      "a guid outside the blog",
      rssItem({ link: `${origin}/second-post` }),
      /not https:\/\/educates\.dev\/blog\/<slug>/,
    ],
    [
      "a guid whose post the build does not serve",
      rssItem({ link: `${origin}/blog/third-post` }),
      /third-post .*not served/,
    ],
  ])("fails an RSS item with %s", (_, item, message) => {
    const findings = check({
      "blog/rss.xml": rssFeed(rssItem({ link: first }), item),
    });
    expect(findings).toMatchObject([
      { rule: "feed-identity", severity: "error" },
    ]);
    expect(findings[0].message).toContain("blog/rss.xml");
    expect(findings[0].message).toMatch(message);
  });

  it.each([
    ["no id", atomEntry({ link: second, id: "" }), /no id/],
    [
      "an id other than its link",
      atomEntry({ link: second, id: `<id>${first}</id>` }),
      /id .*first-post is not its link .*second-post/,
    ],
    [
      "an id with a trailing slash",
      atomEntry({ link: `${second}/` }),
      /second-post\/ .*trailing slash/,
    ],
    [
      "an id outside the blog",
      atomEntry({ link: `${origin}/blog/tags/second-post` }),
      /not https:\/\/educates\.dev\/blog\/<slug>/,
    ],
    [
      "an id whose post the build does not serve",
      atomEntry({ link: `${origin}/blog/third-post` }),
      /third-post .*not served/,
    ],
  ])("fails an Atom entry with %s", (_, entry, message) => {
    const findings = check({
      "blog/atom.xml": atomFeed({}, atomEntry({ link: first }), entry),
    });
    expect(findings).toMatchObject([
      { rule: "feed-identity", severity: "error" },
    ]);
    expect(findings[0].message).toContain("blog/atom.xml");
    expect(findings[0].message).toMatch(message);
  });

  it.each([
    ["with a trailing slash", `${origin}/blog/`],
    ["of another page", `${origin}/`],
  ])("fails an Atom feed whose id is the blog's URL %s", (_, id) => {
    const findings = check({
      "blog/atom.xml": atomFeed({ id }, atomEntry({ link: first })),
    });
    expect(findings).toMatchObject([
      { rule: "feed-identity", severity: "error" },
    ]);
    expect(findings[0].message).toContain("blog/atom.xml");
    expect(findings[0].message).toContain(
      `feed id ${id} is not ${origin}/blog`,
    );
  });

  it("reads identities outside the posts' HTML only", () => {
    const content = `<p>An RSS example:</p><pre>&lt;guid&gt;x&lt;/guid&gt;</pre><item><guid>${origin}/blog/nowhere</guid></item><entry><id>urn:x</id></entry>`;
    expect(
      check({
        "blog/rss.xml": rssFeed(rssItem({ link: first, content })),
        "blog/atom.xml": atomFeed({}, atomEntry({ link: first, content })),
      }),
    ).toEqual([]);
  });
});
