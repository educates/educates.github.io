import type { Sidebar, SidebarItem } from "./sidebar.ts";

/** Where the Getting Started Guides live. */
const base = "/getting-started-guides";

/**
 * A page of the Getting Started Guides, as the guides collection holds it.
 * The id is the page's file path under the collection without its
 * extension: `index` is the overview, a top-level id such as `setup` is a
 * part of the path, and `setup/docker` is a page inside that part.
 */
export interface GuidePage {
  id: string;
  title: string;
  /** Where the page sits among the parts, or among its part's pages. */
  order: number;
}

/** A link to another page along the path. */
export interface PathLink {
  id: string;
  label: string;
  href: string;
}

/** The Getting Started Guides as one numbered path. */
export interface GuidePath {
  /** The overview, then each part numbered with its pages under it. */
  sidebar: Sidebar;
  /**
   * The pages before and after page `id` in reading order: the overview,
   * then each part followed by its pages.
   */
  around(id: string): { previous?: PathLink; next?: PathLink };
  /**
   * The part page `id` belongs to, or is: its number on the path, how many
   * parts there are, and its title. The overview belongs to no part.
   */
  partOf(
    id: string,
  ): { number: number; count: number; title: string } | undefined;
  /** The URL path of page `id`. */
  href(id: string): string;
}

/** Arranges the guides' pages into one path: the overview, then its parts. */
export function guidePath(pages: GuidePage[]): GuidePath {
  const byOrder = (a: GuidePage, b: GuidePage) => a.order - b.order;
  const overview = pages.find((page) => page.id === "index");
  const parts = pages
    .filter((page) => page.id !== "index" && !page.id.includes("/"))
    .sort(byOrder);
  const pagesOf = (part: GuidePage) =>
    pages.filter((page) => parentOf(page.id) === part.id).sort(byOrder);

  for (const page of pages) {
    const parent = parentOf(page.id);
    if (parent !== undefined && !parts.some((part) => part.id === parent)) {
      throw new Error(
        `The guide page ${page.id} is not inside a part of the path: a part is a top-level folder with an index page, such as setup/index.md`,
      );
    }
  }

  const sidebar: Sidebar = {
    label: overview?.title ?? "Getting Started Guides",
    href: base,
    items: parts.map((part, index): SidebarItem => {
      const inside = pagesOf(part);
      return {
        marker: String(index + 1),
        label: part.title,
        href: hrefOf(part.id),
        ...(inside.length > 0 && {
          items: inside.map((page) => ({
            label: page.title,
            href: hrefOf(page.id),
          })),
        }),
      };
    }),
  };
  const reading = [
    ...(overview ? [overview] : []),
    ...parts.flatMap((part) => [part, ...pagesOf(part)]),
  ];
  const linkTo = (page: GuidePage | undefined): PathLink | undefined =>
    page && { id: page.id, label: page.title, href: hrefOf(page.id) };

  return {
    sidebar,
    around(id) {
      const index = reading.findIndex((page) => page.id === id);
      if (index === -1) throw new Error(`No guide page ${id} on the path`);
      const previous = linkTo(reading[index - 1]);
      const next = linkTo(reading[index + 1]);
      return { ...(previous && { previous }), ...(next && { next }) };
    },
    partOf(id) {
      const index = parts.findIndex(
        (part) => part.id === id || part.id === parentOf(id),
      );
      return index === -1
        ? undefined
        : { number: index + 1, count: parts.length, title: parts[index].title };
    },
    href: hrefOf,
  };
}

function parentOf(id: string): string | undefined {
  const slash = id.lastIndexOf("/");
  return slash === -1 ? undefined : id.slice(0, slash);
}

function hrefOf(id: string): string {
  return id === "index" ? base : `${base}/${id}`;
}
