import { describe, expect, it } from "vitest";
import { pageCover, pageCoverAttribute } from "../page-cover.ts";

/** A built page in the shape the base layout writes. */
function builtPage({
  title = "Hands-on events",
  path = "/use-cases/hands-on-events",
  description = "Run a workshop for a room full of people.",
  body = "",
  main = "",
}: {
  title?: string;
  path?: string;
  description?: string;
  body?: string;
  main?: string;
}): string {
  return `<!doctype html><html lang="en"><head>
    <title>${title} | Educates</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="https://educates.dev${path}">
    <meta property="og:title" content="${title}">
    </head><body ${body}>
    <header><h2>Use cases</h2><h2>Features</h2></header>
    <main id="main"><h1>${title}</h1>${main}</main>
    <footer><h2>Learn</h2><h2>Elsewhere</h2></footer>
    </body></html>`;
}

describe("pageCover", () => {
  it("draws any other page from its title, section and the h2 headings inside <main>", () => {
    const html = builtPage({
      body: 'data-section="Use case"',
      main: "<h2>Before the event</h2><section><h2>On the day</h2></section><h3>Rooms</h3><h2>Afterwards</h2>",
    });
    expect(pageCover(html)).toEqual({
      form: "page",
      title: "Hands-on events",
      section: "Use case",
      path: "/use-cases/hands-on-events",
      headings: ["Before the event", "On the day", "Afterwards"],
    });
  });

  it("skips headings inside navigation, such as a table of contents", () => {
    const html = builtPage({
      main: '<article><h2>Install</h2><h2>Verify</h2></article><nav aria-labelledby="toc"><h2 id="toc">On this page</h2></nav>',
    });
    expect(pageCover(html)).toMatchObject({ headings: ["Install", "Verify"] });
  });

  it("leaves the section out for a page outside any section", () => {
    expect(pageCover(builtPage({ path: "/downloads" }))).toEqual({
      form: "page",
      title: "Hands-on events",
      path: "/downloads",
      headings: [],
    });
  });

  it("reads a heading's text as a reader sees it", () => {
    const html = builtPage({
      main: '<h2 id="why">Why <code>kubectl</code> &amp; the\n   CLI?</h2><h2>Two</h2>',
    });
    expect(pageCover(html)).toMatchObject({
      headings: ["Why kubectl & the CLI?", "Two"],
    });
  });

  it("draws a blog post from what its page declares, its headings and its description", () => {
    const attribute = pageCoverAttribute({
      form: "post",
      slug: "reviewing-workshops-with-ai",
      minutes: 6,
      date: new Date("2026-02-26"),
    });
    const html = builtPage({
      title: "Reviewing workshops with AI",
      path: "/blog/reviewing-workshops-with-ai",
      description: "Having the Claude browser extension review a workshop.",
      body: `data-section="Blog post" data-cover="${attribute.replace(/"/g, "&quot;")}"`,
      main: "<h2>Claude in the browser</h2>",
    });
    expect(pageCover(html)).toEqual({
      form: "post",
      title: "Reviewing workshops with AI",
      slug: "reviewing-workshops-with-ai",
      minutes: 6,
      date: new Date("2026-02-26"),
      description: "Having the Claude browser extension review a workshop.",
      headings: ["Claude in the browser"],
    });
  });

  it("draws a part of the Getting Started Guides from the path its page declares", () => {
    const steps = [
      { marker: "1", label: "Set up" },
      { marker: "2", label: "What you just installed" },
    ];
    const attribute = pageCoverAttribute({ form: "guide", part: 1, steps });
    const html = builtPage({
      title: "Install Docker",
      path: "/getting-started-guides/setup/docker",
      body: `data-section="Getting Started Guides" data-cover='${attribute}'`,
      main: "<h2>On macOS</h2><h2>On Linux</h2>",
    });
    expect(pageCover(html)).toEqual({
      form: "guide",
      title: "Install Docker",
      part: 1,
      steps,
    });
  });

  it("draws the Session pane on a page that declares it, with its section", () => {
    const attribute = pageCoverAttribute({ form: "session" });
    const html = builtPage({
      title: "Hands-on workshops and demos, ready in one click",
      path: "/",
      body: `data-cover='${attribute}'`,
      main: "<h2>Use cases</h2><h2>Features</h2>",
    });
    expect(pageCover(html)).toEqual({
      form: "session",
      title: "Hands-on workshops and demos, ready in one click",
    });
  });
});
