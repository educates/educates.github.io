import { describe, expect, it } from "vitest";
import { paginate } from "../pagination.ts";

const numbers = (count: number) =>
  Array.from({ length: count }, (_, index) => index + 1);

describe("paginate", () => {
  it("puts 10 items on each page, the first at the base path and the rest under /page/N", () => {
    const pages = paginate(numbers(25), "/blog");
    expect(pages.map((page) => [page.path, page.items.length])).toEqual([
      ["/blog", 10],
      ["/blog/page/2", 10],
      ["/blog/page/3", 5],
    ]);
    expect(pages[1].items[0]).toBe(11);
  });

  it("links each page to the pages before and after it", () => {
    const pages = paginate(numbers(25), "/blog/tags/educates");
    expect(
      pages.map((page) => [page.number, page.previous, page.next]),
    ).toEqual([
      [1, undefined, "/blog/tags/educates/page/2"],
      [2, "/blog/tags/educates", "/blog/tags/educates/page/3"],
      [3, "/blog/tags/educates/page/2", undefined],
    ]);
  });

  it("makes one page when everything fits on it", () => {
    const pages = paginate(numbers(10), "/blog/authors/jorge");
    expect(pages).toEqual([
      {
        number: 1,
        count: 1,
        path: "/blog/authors/jorge",
        items: numbers(10),
        previous: undefined,
        next: undefined,
      },
    ]);
  });

  it("makes one empty page when there is nothing to list", () => {
    expect(paginate([], "/blog")).toMatchObject([
      { number: 1, count: 1, path: "/blog", items: [] },
    ]);
  });
});
