/** Site-wide settings shared by the Astro config, the pages and the site check. */
export interface SiteSettings {
  /** The origin of every canonical URL, `og:url` and sitemap entry. */
  readonly origin: string;
  /** The name appended to every page title. */
  readonly name: string;
  /** The site's source on GitHub, where "Edit this page" links point. */
  readonly repository: string;
  /** The branch pull requests target, which edit links open. */
  readonly sourceBranch: string;
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
  /**
   * GoatCounter, which counts page views: `endpoint` is the site's `/count`
   * URL, where count.js sends each page view, and `script` is where
   * count.js is loaded from. Hosted GoatCounter and a self-hosted instance
   * differ only in these two URLs.
   */
  readonly goatCounter: {
    readonly endpoint: string;
    readonly script: string;
  };
}

export const site: SiteSettings = {
  origin: "https://educates.dev",
  name: "Educates",
  repository: "https://github.com/educates/educates.github.io",
  sourceBranch: "develop",
  educates4Released: false,
  sponsorsListingPublic: false,
  goatCounter: {
    endpoint: "https://educates.goatcounter.com/count",
    script: "https://gc.zgo.at/count.js",
  },
};
