import { markdownToHtml, type MarkdownToHtmlResult } from "satteri";
import { describe, expect, it } from "vitest";
import { admonitions } from "./admonitions.ts";

/** Markdown rendered to HTML as the site's pipeline does, with the plugin. */
function render(markdown: string): string {
  // The plugin is synchronous, so the compile is too.
  const result = markdownToHtml(markdown, {
    features: { directive: true },
    mdastPlugins: [admonitions()],
    fileURL: new URL("file:///site/src/content/posts/a-post/index.md"),
  }) as MarkdownToHtmlResult;
  return result.html.trim();
}

describe("admonitions", () => {
  it("renders :::note as a callout titled Note around its body", () => {
    expect(render(":::note\nKeep this in mind.\n:::\n")).toBe(
      '<aside class="callout callout-note" role="note"><p class="callout-title">Note</p><div class="callout-body"><p>Keep this in mind.</p></div></aside>',
    );
  });

  it.each([
    ["tip", "Tip"],
    ["info", "Info"],
    ["warning", "Warning"],
    ["danger", "Danger"],
  ])("renders :::%s as a callout titled %s", (type, title) => {
    expect(render(`:::${type}\nBody.\n:::\n`)).toBe(
      `<aside class="callout callout-${type}" role="note"><p class="callout-title">${title}</p><div class="callout-body"><p>Body.</p></div></aside>`,
    );
  });

  it("fails on a container directive of another type, naming it, the file and the line", () => {
    expect(() => render("Intro.\n\n:::caution\nBody.\n:::\n")).toThrow(
      /:::caution .*\/site\/src\/content\/posts\/a-post\/index\.md:3.*note, tip, info, warning, danger/,
    );
  });

  it("keeps a colon followed by a word in text, such as a time or an image tag", () => {
    expect(
      render("Pull ghcr.io/educates/cli:latest at 10:30, then run a:b.\n"),
    ).toBe("<p>Pull ghcr.io/educates/cli:latest at 10:30, then run a:b.</p>");
  });

  it.each([
    ["a leaf directive", "::youtube[A talk]\n", /::youtube .*index\.md:1/],
    [
      "a text directive with a label",
      "Some :abbr[HTML] here.\n",
      /:abbr .*index\.md:1/,
    ],
    [
      "a text directive with attributes",
      "Some :span{.big} here.\n",
      /:span .*index\.md:1/,
    ],
  ])("fails on %s", (_, markdown, message) => {
    expect(() => render(markdown)).toThrow(message);
  });

  it("takes the title from a [Title] label, keeping its formatting", () => {
    expect(render(":::note[***My `Advanced` settings***]\nBody.\n:::\n")).toBe(
      '<aside class="callout callout-note" role="note"><p class="callout-title"><em><strong>My <code>Advanced</code> settings</strong></em></p><div class="callout-body"><p>Body.</p></div></aside>',
    );
  });
});
