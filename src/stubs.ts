/**
 * Stub pages: placeholders for pages of the site still to be written, so
 * every route in the page inventory exists and every link to it resolves.
 * `src/pages/[...stub].astro` renders each one in the stub layout, and the
 * site check reports every stub page in a build.
 *
 * To build one of these pages, add it under `src/pages/` and remove its
 * entry here; the build fails while both exist. Use case and Feature stubs
 * come from their collections instead, in `src/pages/use-cases/[slug].astro`
 * and `src/pages/features/[slug].astro`, and the homepage's is
 * `src/pages/index.astro`.
 */
export interface Stub {
  /** The URL path of the page. */
  path: string;
  title: string;
  description: string;
  /** The site section of the page; a page in a section gets breadcrumbs. */
  section?: string;
}

const guides = "Getting Started Guides";

export const stubs: readonly Stub[] = [
  {
    path: "/features",
    title: "Features",
    description:
      "What Educates gives the people who write workshops, the people who run them, and the platform team that keeps them running.",
    section: "Feature",
  },
  {
    path: "/learn",
    title: "Learn",
    description:
      "Blog posts, guides, videos and talks about Educates, in one list you can filter by kind and Topic.",
  },
  {
    path: "/blog",
    title: "Blog",
    description:
      "Posts from the Educates team on writing workshops, running Educates and what is new in the project.",
  },
  {
    path: "/about-educates",
    title: "About Educates",
    description:
      "How Educates is put together: the operator, training portals, Sessions, the lookup service, and where it runs.",
    section: "About Educates",
  },
  {
    path: "/about-educates/workflows",
    title: "Workflows",
    description: "How a workshop goes from its source to a running Session.",
    section: "About Educates",
  },
  {
    path: "/about-educates/history",
    title: "History",
    description:
      "Where Educates came from, and how it became an independent open source project.",
    section: "About Educates",
  },
  {
    path: "/getting-started-guides/about",
    title: "What you just installed",
    description:
      "The pods, policies and resources a local Educates install gives you, and the commands to see them.",
    section: guides,
  },
  {
    path: "/getting-started-guides/next-steps",
    title: "Next steps",
    description:
      "Deploy a workshop from the Hub, find the reference docs, and get help.",
    section: guides,
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "What educates.dev counts, what it stores in your browser, and how to opt out.",
  },
];
