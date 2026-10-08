/** One level of a breadcrumb trail. A level without `href` is not linked. */
export interface Crumb {
  label: string;
  href?: string;
}

/**
 * The levels above section pages, by URL path. A level with no page of its
 * own, such as "Use cases", is named but not linked.
 */
const levels: Readonly<Record<string, Crumb>> = {
  "/use-cases": { label: "Use cases" },
  "/features": { label: "Features", href: "/features" },
  "/about-educates": { label: "About Educates", href: "/about-educates" },
  "/getting-started-guides": {
    label: "Getting Started Guides",
    href: "/getting-started-guides",
  },
  "/getting-started-guides/setup": {
    label: "Set up",
    href: "/getting-started-guides/setup",
  },
  "/getting-started-guides/authoring": {
    label: "Write your first workshop",
    href: "/getting-started-guides/authoring",
  },
  "/blog": { label: "Blog", href: "/blog" },
  "/blog/tags": { label: "Tags", href: "/blog/tags" },
  "/blog/authors": { label: "Authors", href: "/blog/authors" },
};

/**
 * The breadcrumb trail of the page at URL path `path` titled `title`: each
 * named level above it, then the page itself, unlinked. Home is not
 * included; the Breadcrumbs component adds it.
 */
export function breadcrumbs(path: string, title: string): Crumb[] {
  const segments = path.split("/").filter(Boolean);
  const above = segments
    .slice(0, -1)
    .map((_, index) => levels[`/${segments.slice(0, index + 1).join("/")}`])
    .filter((level): level is Crumb => level !== undefined);
  return [...above, { label: title }];
}
