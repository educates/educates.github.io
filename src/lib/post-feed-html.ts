// A post's body as one HTML string for the blog feeds. A feed reader shows
// it away from the site, without its scripts or styles, so the post renders
// with `feedComponents` (links in place of players), and the HTML is then
// made to stand alone: every link and image URL absolute, scripts, styles
// and buttons dropped, and code blocks reduced to plain <pre><code>.

import { getContainerRenderer as mdxContainerRenderer } from "@astrojs/mdx/container-renderer";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { render } from "astro:content";
import { parse, type HTMLElement } from "node-html-parser";
import { feedComponents } from "../components/feed-components.ts";
import type { Post } from "./posts.ts";

let container: Promise<AstroContainer> | undefined;

/**
 * The HTML of `post` for a feed item. `postUrl` is the post's absolute URL:
 * the post renders as if requested there, and relative URLs resolve
 * against it.
 */
export async function postFeedHtml(
  post: Post,
  postUrl: string,
): Promise<string> {
  container ??= loadRenderers([mdxContainerRenderer()]).then((renderers) =>
    AstroContainer.create({ renderers }),
  );
  const { Content } = await render(post);
  const html = await (
    await container
  ).renderToString(Content, {
    props: { components: feedComponents },
    request: new Request(postUrl),
  });
  return standaloneHtml(html, postUrl);
}

/** Elements that only work on the site: its scripts, styles and controls. */
const siteOnly = "script, style, link, template, button";

/** Attributes that hold a URL, resolved against the post's URL. */
const urlAttributes = ["href", "src", "poster"];

function standaloneHtml(html: string, baseUrl: string): string {
  // Parse inside <pre> too, where Expressive Code puts its lines.
  const root = parse(html, {
    blockTextElements: { script: true, noscript: true, style: true },
  });
  for (const block of root.querySelectorAll(".expressive-code")) {
    block.replaceWith(plainCodeBlock(block));
  }
  for (const element of root.querySelectorAll(siteOnly)) element.remove();
  for (const element of root.querySelectorAll("[href], [src], [poster]")) {
    for (const name of urlAttributes) {
      const value = element.getAttribute(name);
      if (value !== undefined) {
        element.setAttribute(name, escapeAmpersands(absolute(value, baseUrl)));
      }
    }
  }
  for (const element of root.querySelectorAll("[srcset]")) {
    const candidates = (element.getAttribute("srcset") ?? "")
      .split(",")
      .map((candidate) => candidate.trim())
      .filter(Boolean)
      .map((candidate) => {
        const [url, ...descriptor] = candidate.split(/\s+/);
        return [absolute(url, baseUrl), ...descriptor].join(" ");
      });
    element.setAttribute("srcset", escapeAmpersands(candidates.join(", ")));
  }
  return root.toString().trim();
}

/**
 * An Expressive Code frame as plain HTML: its title, when it has one, and
 * its lines in a <pre><code>, without the per-line markup and token colours
 * that need the site's styles.
 */
function plainCodeBlock(block: HTMLElement): string {
  const title = block.querySelector(".title")?.rawText.trim();
  const language = block.querySelector("pre")?.getAttribute("data-language");
  const lines = block
    .querySelectorAll(".ec-line .code")
    // An empty line holds a lone newline, so that it keeps its height.
    .map((line) => line.rawText.replace(/^\n$/, ""));
  const languageClass = language ? ` class="language-${language}"` : "";
  const caption = title ? `<p><code>${title}</code></p>` : "";
  return `${caption}<pre><code${languageClass}>${lines.join("\n")}</code></pre>`;
}

/**
 * An attribute value ready to write as markup: `setAttribute()` writes it
 * as given, quoting it and escaping only its double quotes.
 */
function escapeAmpersands(value: string): string {
  return value.replace(/&/g, "&amp;");
}

function absolute(url: string, baseUrl: string): string {
  try {
    return new URL(url.trim(), baseUrl).href;
  } catch {
    return url;
  }
}
