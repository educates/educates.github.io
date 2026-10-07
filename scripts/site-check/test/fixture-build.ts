import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Writes a small build output to a new temporary directory and returns its
 * path. Keys are paths relative to the build root, values file contents.
 */
export function fixtureBuild(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "site-check-"));
  for (const [path, content] of Object.entries(files)) {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return root;
}

/** A page with the head the base layout writes for `url`. */
export function page(url: string, extraHead = ""): string {
  return `<!doctype html><html lang="en"><head><title>Page</title><link rel="canonical" href="${url}"><meta property="og:url" content="${url}">${extraHead}</head><body><main><h1>Page</h1></main></body></html>`;
}

/** A stub page: the base layout's head for `url`, and the stub marker. */
export function stubPage(url: string): string {
  return page(url).replace("<body>", "<body data-stub>");
}

/** An HTML redirect page in the form Astro's `redirects` writes. */
export function redirectPage(target: string): string {
  const canonical = new URL(target, "https://educates.dev").href;
  return `<!doctype html><title>Redirecting to: ${target}</title><meta http-equiv="refresh" content="0;url=${target}"><meta name="robots" content="noindex"><link rel="canonical" href="${canonical}"><body><a href="${target}">Redirecting to <code>${target}</code></a></body>`;
}

/** An RSS item; by default its `guid` is its link, as a permalink. */
export function rssItem({
  link,
  guid = `<guid isPermaLink="true">${link}</guid>`,
  content = "<p>Post</p>",
}: {
  link: string;
  /** The whole `<guid>` element, or "" for none. */
  guid?: string;
  /** The item's HTML. */
  content?: string;
}): string {
  return `<item><title><![CDATA[Post]]></title><link>${link}</link>${guid}<pubDate>Sat, 28 Feb 2026 00:00:00 GMT</pubDate><description><![CDATA[A post.]]></description><content:encoded><![CDATA[${content}]]></content:encoded></item>`;
}

/** An RSS 2.0 feed of the blog in the form the `feed` library writes. */
export function rssFeed(...items: string[]): string {
  return `<?xml version="1.0" encoding="utf-8"?><?xml-stylesheet href="rss.xsl" type="text/xsl"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>Blog</title><link>https://educates.dev/blog</link><description>Blog</description>${items.join("")}</channel></rss>`;
}

/** An Atom entry; by default its `id` is its link. */
export function atomEntry({
  link,
  id = `<id>${link}</id>`,
  content = "<p>Post</p>",
}: {
  link: string;
  /** The whole `<id>` element, or "" for none. */
  id?: string;
  /** The entry's HTML. */
  content?: string;
}): string {
  return `<entry><title type="html"><![CDATA[Post]]></title>${id}<link href="${link}"/><updated>2026-02-28T00:00:00.000Z</updated><summary type="html"><![CDATA[A post.]]></summary><content type="html"><![CDATA[${content}]]></content></entry>`;
}

/** An Atom feed of the blog in the form the `feed` library writes. */
export function atomFeed(
  { id = "https://educates.dev/blog" }: { id?: string },
  ...entries: string[]
): string {
  return `<?xml version="1.0" encoding="utf-8"?><?xml-stylesheet href="atom.xsl" type="text/xsl"?><feed xmlns="http://www.w3.org/2005/Atom"><id>${id}</id><title>Blog</title><updated>2026-02-28T00:00:00.000Z</updated><link rel="alternate" href="https://educates.dev/blog"/>${entries.join("")}</feed>`;
}
