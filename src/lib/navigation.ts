// The site's navigation, shared by the header menus, the phone sheet and
// the footer. Use cases and Features come from their collections, so adding
// an entry adds it everywhere.

import {
  featurePath,
  flagshipFeatures,
  useCasePath,
  useCases,
} from "./content.ts";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

/** Where the project lives outside this site. */
export const elsewhere = {
  docs: { label: "Docs", href: "https://docs.educates.dev" },
  hub: { label: "Hub", href: "https://hub.educates.dev" },
  github: {
    label: "GitHub",
    href: "https://github.com/educates/educates-training-platform",
  },
  slack: {
    label: "Slack",
    href: "https://kubernetes.slack.com/archives/C05UWT4SKRV",
  },
  youtube: {
    label: "YouTube",
    href: "https://www.youtube.com/@EducatesTrainingPlatform",
  },
} as const satisfies Record<string, NavLink>;

/** The one call to action in the header, the phone sheet and the footer. */
export const getStarted: NavLink = {
  label: "Get started",
  href: "/get-started",
};

const learnLinks: NavLink[] = [
  { label: "All Content", href: "/learn" },
  { label: "Getting Started Guides", href: "/getting-started-guides" },
  { label: "About Educates", href: "/about-educates" },
];

const projectLinks: NavLink[] = [
  getStarted,
  { label: "Get help", href: "/get-help" },
  { label: "Community", href: "/community" },
  { label: "Downloads", href: "/downloads" },
];

/** The header's four menus, which the phone sheet lists open. */
export async function headerMenus(): Promise<NavGroup[]> {
  return [
    {
      label: "Use cases",
      links: (await useCases()).map((entry) => ({
        label: entry.data.name,
        href: useCasePath(entry.id),
      })),
    },
    {
      label: "Features",
      links: [
        { label: "All Features", href: "/features" },
        ...(await flagshipFeatures()).map((entry) => ({
          label: entry.data.name,
          href: featurePath(entry.id),
        })),
      ],
    },
    { label: "Learn", links: learnLinks },
    { label: "Project", links: projectLinks },
  ];
}

/** The footer's columns after the brand: the human site map. */
export async function footerColumns(): Promise<NavGroup[]> {
  const [useCaseMenu, featureMenu] = await headerMenus();
  return [
    useCaseMenu,
    featureMenu,
    {
      label: "Learn",
      links: [...learnLinks, { label: "Blog", href: "/blog" }],
    },
    {
      label: "Project",
      links: [...projectLinks, { label: "Privacy", href: "/privacy" }],
    },
    {
      label: "Elsewhere",
      links: [
        elsewhere.docs,
        { label: "The Hub", href: elsewhere.hub.href },
        elsewhere.github,
        elsewhere.slack,
        elsewhere.youtube,
      ],
    },
  ];
}
