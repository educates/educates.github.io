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
  // About Educates went from six pages to three: Deployment is now
  // Architecture's "Where it runs", Workshop Capabilities became the
  // Features overview, and Local Development the guides' Set up part.
  "/about-educates/deployment": "/about-educates",
  "/about-educates/workshop-capabilities": "/features",
  "/about-educates/local-dev": "/getting-started-guides/setup",
  // The guides' Components and CRDs pages became "What you just installed",
  // and their workflow page moved to About Educates.
  "/getting-started-guides/about/components": "/getting-started-guides/about",
  "/getting-started-guides/about/crds": "/getting-started-guides/about",
  "/getting-started-guides/about/workflow": "/about-educates/workflows",
  // Next steps replaced the guides' list of questions to explore a Session.
  "/getting-started-guides/authoring/explore":
    "/getting-started-guides/next-steps",
};

/**
 * Redirects from a source that ends in a slash, the URL of a directory,
 * which Astro's `redirects` cannot express. Each is a page in `public/`,
 * `<source>index.html`, written by hand from the template of Astro's
 * redirect pages. The site check verifies every one.
 */
export const staticRedirects: Readonly<Record<string, string>> = {
  "/posts/": "/blog",
  "/posts/installation-kind/": "/blog/getting-started-on-kind",
};
