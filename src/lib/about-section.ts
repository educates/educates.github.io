import type { Sidebar } from "./sidebar.ts";

/** Where About Educates lives, and its name in the sidebar. */
const base = "/about-educates";
const label = "About Educates";

/**
 * A page of About Educates, as the about collection holds it. The id is the
 * page's file name without its extension: `index` is the page at the
 * section's own URL, Architecture, and `workflows` is at
 * `/about-educates/workflows`.
 */
export interface AboutPage {
  id: string;
  title: string;
  /** Where the page sits in the section's sidebar. */
  order: number;
}

/** About Educates: a few concept pages, read in any order. */
export interface AboutSection {
  /** The section's name, then its pages in order. */
  sidebar: Sidebar;
  /** The URL path of page `id`. */
  href(id: string): string;
}

/** Arranges the About Educates pages into the section's sidebar. */
export function aboutSection(pages: AboutPage[]): AboutSection {
  for (const page of pages) {
    if (page.id.includes("/")) {
      throw new Error(
        `The About Educates page ${page.id} is in a folder; the section's pages are files directly under it, such as workflows.md`,
      );
    }
  }
  return {
    sidebar: {
      label,
      href: base,
      items: [...pages]
        .sort((a, b) => a.order - b.order)
        .map((page) => ({ label: page.title, href: hrefOf(page.id) })),
    },
    href: hrefOf,
  };
}

function hrefOf(id: string): string {
  return id === "index" ? base : `${base}/${id}`;
}
