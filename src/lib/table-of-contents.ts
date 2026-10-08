// The table of contents of a page rendered from Markdown, from the headings
// that rendering its entry returns. The docs layout and blog posts show it
// beside the page on wide screens.

import type { MarkdownHeading } from "astro";

/** A heading the table of contents links to by its slug. */
export interface TocLink {
  text: string;
  slug: string;
}

/** A section of the page, with the headings one level below it. */
export interface TocEntry extends TocLink {
  children: TocLink[];
}

/**
 * The page's sections, its headings at the highest level it uses, each with
 * the headings one level below it. The page's own title is its only first
 * level heading, so one in the body reads as a section, as `.prose` styles
 * it. Deeper headings, and any before the first section, are left out.
 */
export function tableOfContents(
  headings: readonly MarkdownHeading[],
): TocEntry[] {
  const levelOf = ({ depth }: MarkdownHeading) => Math.max(depth, 2);
  const top = Math.min(...headings.map(levelOf));
  const toc: TocEntry[] = [];
  for (const heading of headings) {
    const { text, slug } = heading;
    const level = levelOf(heading);
    if (level === top) toc.push({ text, slug, children: [] });
    else if (level === top + 1) toc.at(-1)?.children.push({ text, slug });
  }
  return toc;
}

/**
 * A blog post's table of contents: only a post with three or more headings
 * in it has one.
 */
export function postTableOfContents(
  headings: readonly MarkdownHeading[],
): TocEntry[] {
  const toc = tableOfContents(headings);
  const listed = toc.reduce(
    (count, entry) => count + 1 + entry.children.length,
    0,
  );
  return listed >= 3 ? toc : [];
}
