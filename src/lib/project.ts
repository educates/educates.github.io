// The project's own links, contacts and calls to action, shared by the
// project pages, the homepage strip and the use case pages.

import { site, type SiteSettings } from "../site.ts";

/** The training platform's GitHub repository, where Educates is developed. */
export const platformRepository =
  "https://github.com/educates/educates-training-platform";

/** Where bugs and feature requests go. */
export const issuesUrl = `${platformRepository}/issues`;

/** How to contribute, and the code of conduct, on the default branch. */
export const contributingUrl = `${platformRepository}/blob/develop/CONTRIBUTING.md`;
export const codeOfConductUrl = `${platformRepository}/blob/develop/CODE_OF_CONDUCT.md`;

/** Where to get an invite to the Kubernetes Slack. */
export const kubernetesSlackInvite = "https://slack.k8s.io";

/** Paid help: what the team takes on, and who to email for it. */
export const paidHelp = {
  email: "contact@educates.dev",
  offers: [
    "Installing and running Educates on your own clusters",
    "Building a Demo Platform on Educates",
    "Writing workshops for your product or your team",
  ],
} as const;

/** "Get help": help from the community, and paid help from the team. */
export const getHelp = { label: "Get help", href: "/get-help" } as const;

/** "Get help building yours": paid help, for a use case built with the team. */
export const getHelpBuildingYours = {
  label: "Get help building yours",
  href: "/get-help#hire-us",
} as const;

/** A call to action: a short title, one line of text and where it leads. */
export interface ProjectCall {
  title: string;
  text: string;
  /** The link's own text. */
  label: string;
  href: string;
}

/**
 * "Support the project", or nothing while the `educates` GitHub Sponsors
 * listing is not public, so no visitor is sent to a dead end. Follows the
 * site's Sponsors setting unless given `settings`.
 */
export function supportTheProject(
  settings: Pick<SiteSettings, "sponsorsListingPublic"> = site,
): ProjectCall | undefined {
  if (!settings.sponsorsListingPublic) return undefined;
  return {
    title: "Support the project",
    text: "Help keep Educates maintained through GitHub Sponsors.",
    label: "Support Educates on GitHub",
    href: "https://github.com/sponsors/educates",
  };
}
