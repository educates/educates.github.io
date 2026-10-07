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
    path: "/getting-started-guides",
    title: guides,
    description:
      "One path from an empty laptop to your first workshop: set up, look at what you installed, write a workshop, then where to go next.",
    section: guides,
  },
  {
    path: "/getting-started-guides/setup",
    title: "Set up",
    description:
      "Install Docker, kubectl and the Educates CLI, and create a local Educates cluster.",
    section: guides,
  },
  {
    path: "/getting-started-guides/setup/docker",
    title: "Installing Docker",
    description:
      "Install Docker, which runs the local Kubernetes cluster that Educates uses.",
    section: guides,
  },
  {
    path: "/getting-started-guides/setup/kubectl",
    title: "Installing kubectl",
    description:
      "Install kubectl to look at what Educates runs in your cluster.",
    section: guides,
  },
  {
    path: "/getting-started-guides/setup/educates",
    title: "Installing the Educates CLI",
    description: "Install the educates CLI on macOS or Linux.",
    section: guides,
  },
  {
    path: "/getting-started-guides/setup/create-cluster",
    title: "Creating an Educates cluster",
    description:
      "Create a local Kind cluster with Educates installed, in one command.",
    section: guides,
  },
  {
    path: "/getting-started-guides/about",
    title: "What you just installed",
    description:
      "The pods, policies and resources a local Educates install gives you, and the commands to see them.",
    section: guides,
  },
  {
    path: "/getting-started-guides/authoring",
    title: "Write your first workshop",
    description:
      "Create a workshop, prepare its Sessions with setup scripts, guide the work with clickable actions, and edit it live.",
    section: guides,
  },
  {
    path: "/getting-started-guides/authoring/basics",
    title: "Workshop basics",
    description:
      "Generate a workshop with the educates CLI, learn its layout, and deploy it to your cluster.",
    section: guides,
  },
  {
    path: "/getting-started-guides/authoring/startup-interactivity",
    title: "Setup scripts and interactivity",
    description:
      "Prepare each Session with setup scripts, and guide the work with clickable actions and checks.",
    section: guides,
  },
  {
    path: "/getting-started-guides/authoring/live-edit",
    title: "Live editing",
    description:
      "See changes to a workshop in a running Session as you make them.",
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
    path: "/get-started",
    title: "Get started",
    description:
      "Run Educates on your laptop, deploy a workshop from the Hub, or talk to us.",
  },
  {
    path: "/get-help",
    title: "Get help",
    description:
      "Ask the community on Slack or GitHub, or hire us to install Educates, build a Demo Platform or write workshops.",
  },
  {
    path: "/community",
    title: "Community",
    description:
      "The people behind Educates, how to contribute, and where to talk to us.",
  },
  {
    path: "/downloads",
    title: "Downloads",
    description:
      "The educates CLI for macOS and Linux, from the latest GitHub release.",
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "What educates.dev counts, what it stores in your browser, and how to opt out.",
  },
];
