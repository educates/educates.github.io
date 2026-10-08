import { describe, expect, it } from "vitest";
import { parseMustResolveList } from "../must-resolve-list.ts";
import { loadSiteUrls } from "../site-urls.ts";

describe("must-resolve list", () => {
  it("rejects an entry that is not a URL path", () => {
    expect(() => parseMustResolveList("[Blog]\nblog/archive\n")).toThrow(
      /line 2.*blog\/archive/,
    );
  });

  it("rejects an entry listed twice", () => {
    expect(() => parseMustResolveList("[A]\n/blog\n[B]\n/blog\n")).toThrow(
      /line 4.*\/blog/,
    );
  });

  describe("the committed list", () => {
    const { entries } = loadSiteUrls();
    const count = (section: string) =>
      entries.filter((entry) => entry.section === section).length;

    // Counts from the URL inventory of the Docusaurus site and the
    // migration plan's additions.
    it.each([
      ["Site pages", 3],
      ["About Educates", 6],
      ["Getting Started Guides", 15],
      ["Blog posts", 17],
      ["Blog index and archive", 3],
      ["Tag pages", 19],
      ["Author pages", 4],
      ["Not-found page", 1],
      ["Feeds", 2],
      ["Crawler and host files", 3],
      ["Kept assets", 10],
      ["Content-hashed images embedded in the feeds", 24],
      ["Redirect sources not listed above", 4],
    ])("lists %s: %i", (section, expected) => {
      expect(count(section)).toBe(expected);
    });

    it("holds the 67 pages of the old sitemap", () => {
      const pageSections = [
        "Site pages",
        "About Educates",
        "Getting Started Guides",
        "Blog posts",
        "Blog index and archive",
        "Tag pages",
        "Author pages",
      ];
      const pages = entries.filter((entry) =>
        pageSections.includes(entry.section),
      );
      expect(pages).toHaveLength(67);
    });
  });
});
