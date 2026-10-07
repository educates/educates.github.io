/** Site-wide settings shared by the Astro config, the pages and the site check. */
export const site = {
  /** The origin of every canonical URL, `og:url` and sitemap entry. */
  origin: "https://educates.dev",
  /** The name appended to every page title. */
  name: "Educates",
} as const;
