// The cover of a page on the site, read back from the page as built. The
// base layout writes what the page alone knows about its cover into the
// page; the Open Graph image step reads that, the page's title, its section
// and its `h2` headings, and draws the cover from them.

import { parse, type HTMLElement } from "node-html-parser";
import type { CoverProps, GuideStep } from "./cover.ts";

/**
 * What a page declares about its cover beyond its title, section, headings
 * and description, which the cover reads from the built page. A page that
 * declares nothing gets the cover of any other page.
 */
export type PageCoverData =
  /** A blog post: its slug, reading time and date. */
  | { form: "post"; slug: string; minutes: number; date: Date }
  /** A page of the Getting Started Guides that belongs to a part. */
  | { form: "guide"; part: number; steps: GuideStep[] }
  /** A page whose window is always the Session pane, such as the homepage. */
  | { form: "session" };

/** The value of the `data-cover` attribute the base layout writes on <body>. */
export function pageCoverAttribute(data: PageCoverData): string {
  return JSON.stringify(data);
}

/**
 * The cover of a built page, from its HTML: the title it shares
 * (`og:title`), its section (`data-section` on <body>), the text of the
 * `h2` headings inside <main> but outside any <nav>, such as a table of
 * contents, its description, the URL path of its canonical URL, and what it
 * declares in `data-cover`.
 */
export function pageCover(html: string): CoverProps {
  const document = parse(html);
  const body = document.querySelector("body");
  const title = metaContent(document, 'meta[property="og:title"]');
  const section = body?.getAttribute("data-section");
  const declared = body?.getAttribute("data-cover");
  const data = declared ? readData(declared) : undefined;
  const headings = document
    .querySelectorAll("main h2")
    .filter((heading) => heading.closest("nav") === null)
    .map((heading) => heading.text.replace(/\s+/g, " ").trim());

  switch (data?.form) {
    case "post":
      return {
        ...data,
        title,
        description: metaContent(document, 'meta[name="description"]'),
        headings,
      };
    case "guide":
      return { ...data, title };
    case "session":
      return { form: "session", title, ...(section && { section }) };
    case undefined: {
      const canonical = document
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href");
      if (!canonical) throw new Error("The page has no canonical URL");
      return {
        form: "page",
        title,
        ...(section && { section }),
        path: new URL(canonical).pathname,
        headings,
      };
    }
  }
}

function readData(attribute: string): PageCoverData {
  const data = JSON.parse(attribute) as PageCoverData;
  return data.form === "post" ? { ...data, date: new Date(data.date) } : data;
}

function metaContent(document: HTMLElement, selector: string): string {
  const content = document.querySelector(selector)?.getAttribute("content");
  if (content === undefined) {
    throw new Error(`The page has no ${selector}`);
  }
  return content;
}
