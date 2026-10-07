/** Site-wide settings shared by the Astro config, the pages and the site check. */
export interface SiteSettings {
  /** The origin of every canonical URL, `og:url` and sitemap entry. */
  readonly origin: string;
  /** The name appended to every page title. */
  readonly name: string;
  /**
   * Whether Educates 4.0 is released. The site describes the release
   * current at launch, so 4.0-only Features and claims, such as Helm and
   * GitOps install, air-gapped install and the image pre-puller, show only
   * when this is on.
   */
  readonly educates4Released: boolean;
  /**
   * Whether the `educates` GitHub Sponsors listing is public. "Support the
   * project" shows only when this is on.
   */
  readonly sponsorsListingPublic: boolean;
}

export const site: SiteSettings = {
  origin: "https://educates.dev",
  name: "Educates",
  educates4Released: false,
  sponsorsListingPublic: false,
};
