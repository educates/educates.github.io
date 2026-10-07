/**
 * The site's redirects: an old URL path and the path or URL it now points
 * to. Astro's `redirects` setting writes each one as an HTML redirect page
 * (an immediate meta refresh, `robots` `noindex` and a canonical link to the
 * target), the only kind of redirect GitHub Pages serves, and the sitemap
 * leaves them out. The site check verifies every one.
 *
 * A source must not end in a slash, which Astro's `redirects` cannot
 * express, and no source or target may use `/hub`, which is reserved.
 */
export const redirects: Readonly<Record<string, string>> = {
  "/docs": "https://docs.educates.dev",
  "/team": "/community",
  "/resources": "/learn",
  // The guides' Components and CRDs pages became "What you just installed",
  // and their workflow page moved to About Educates.
  "/getting-started-guides/about/components": "/getting-started-guides/about",
  "/getting-started-guides/about/crds": "/getting-started-guides/about",
  "/getting-started-guides/about/workflow": "/about-educates/workflows",
};
