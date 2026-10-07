import type { MarkdownHeading } from "astro";
import { describe, expect, it } from "vitest";
import { postTableOfContents, tableOfContents } from "../table-of-contents.ts";

/** Headings as rendering an entry returns them, from `[depth, text]`. */
function headings(...list: [number, string][]): MarkdownHeading[] {
  return list.map(([depth, text]) => ({
    depth,
    text,
    slug: text.toLowerCase().replaceAll(" ", "-"),
  }));
}

describe("tableOfContents", () => {
  it("lists each section with the headings one level below it", () => {
    expect(
      tableOfContents(
        headings(
          [2, "Prerequisites"],
          [3, "DNS"],
          [3, "Cluster"],
          [4, "Node pools"],
          [2, "Installation"],
        ),
      ),
    ).toEqual([
      {
        text: "Prerequisites",
        slug: "prerequisites",
        children: [
          { text: "DNS", slug: "dns" },
          { text: "Cluster", slug: "cluster" },
        ],
      },
      { text: "Installation", slug: "installation", children: [] },
    ]);
  });

  it("reads a first level heading in the body as a section, as the page shows it", () => {
    expect(
      tableOfContents(
        headings(
          [2, "Local CA"],
          [1, "Configure a name"],
          [3, "Resolver"],
          [2, "Summary"],
        ),
      ),
    ).toEqual([
      { text: "Local CA", slug: "local-ca", children: [] },
      {
        text: "Configure a name",
        slug: "configure-a-name",
        children: [{ text: "Resolver", slug: "resolver" }],
      },
      { text: "Summary", slug: "summary", children: [] },
    ]);
  });

  it("starts from the highest level the page uses, such as third level headings only", () => {
    expect(
      tableOfContents(
        headings([3, "At launch"], [4, "Workshops"], [3, "On the horizon"]),
      ),
    ).toEqual([
      {
        text: "At launch",
        slug: "at-launch",
        children: [{ text: "Workshops", slug: "workshops" }],
      },
      { text: "On the horizon", slug: "on-the-horizon", children: [] },
    ]);
  });
});

describe("postTableOfContents", () => {
  it("lists a post with three or more headings in its table of contents", () => {
    expect(
      postTableOfContents(
        headings([2, "Prerequisites"], [3, "DNS"], [2, "Installation"]),
      ),
    ).toEqual([
      {
        text: "Prerequisites",
        slug: "prerequisites",
        children: [{ text: "DNS", slug: "dns" }],
      },
      { text: "Installation", slug: "installation", children: [] },
    ]);
  });

  it("gives a post with fewer than three headings none", () => {
    expect(
      postTableOfContents(headings([2, "Asciinema"], [4, "Options"])),
    ).toEqual([]);
    expect(postTableOfContents(headings([2, "Setup"], [2, "Summary"]))).toEqual(
      [],
    );
    expect(postTableOfContents([])).toEqual([]);
  });
});
