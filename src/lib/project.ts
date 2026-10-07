// The project's own calls to action, shared by the project pages and the
// homepage strip.

import { site, type SiteSettings } from "../site.ts";

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
