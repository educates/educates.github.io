import { markdownToHtml, type MarkdownToHtmlResult } from "satteri";
import { describe, expect, it } from "vitest";
import { unlinkPosts } from "../unlink-posts.ts";

/** Markdown rendered to HTML with the plugin, leaving out `slugs`. */
function render(markdown: string, slugs: string[]): string {
  // The plugin is synchronous, so the compile is too.
  const result = markdownToHtml(markdown, {
    hastPlugins: [unlinkPosts(new Set(slugs))],
  }) as MarkdownToHtmlResult;
  return result.html.trim();
}

describe("unlink posts", () => {
  it("turns a link to a left-out post into its text, keeping the formatting", () => {
    expect(
      render("Read [the *next* part](/blog/next-part) soon.", ["next-part"]),
    ).toBe("<p>Read the <em>next</em> part soon.</p>");
  });

  it("unlinks a link to an anchor of a left-out post", () => {
    expect(
      render("See [upgrading](/blog/next-part#upgrading).", ["next-part"]),
    ).toBe("<p>See upgrading.</p>");
  });

  it("keeps a link to a published post", () => {
    expect(render("See [part one](/blog/part-one#setup).", ["next-part"])).toBe(
      '<p>See <a href="/blog/part-one#setup">part one</a>.</p>',
    );
  });

  it("keeps links that only look like a left-out post's", () => {
    expect(
      render(
        [
          "[a](/blog/next-part-two)",
          "[b](/blog/tags/next-part)",
          "[c](https://example.com/blog/next-part)",
          "[d](blog/next-part)",
        ].join(" "),
        ["next-part"],
      ),
    ).toBe(
      [
        '<p><a href="/blog/next-part-two">a</a>',
        '<a href="/blog/tags/next-part">b</a>',
        '<a href="https://example.com/blog/next-part">c</a>',
        '<a href="blog/next-part">d</a></p>',
      ].join(" "),
    );
  });

  it("unlinks every link to a left-out post, by reference too", () => {
    expect(
      render(
        "[One](/blog/next-part), [two][ref].\n\n[ref]: /blog/next-part\n",
        ["next-part"],
      ),
    ).toBe("<p>One, two.</p>");
  });
});
