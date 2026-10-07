import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { singleSitemap } from "./src/integrations/single-sitemap.ts";
import { redirects } from "./src/redirects.ts";
import { site } from "./src/site.ts";

// URL form (docs/adr/0002-keep-the-docusaurus-url-form.md): every page
// builds as `<path>.html` and its canonical URL has no trailing slash, so
// GitHub Pages serves `/page` and `/page.html`, and `/page/` is a 404.
export default defineConfig({
  site: site.origin,
  trailingSlash: "never",
  build: {
    format: "file",
  },
  redirects: { ...redirects },
  // Two routes building the same URL fail the build, such as a new page
  // whose stub in src/stubs.ts is still listed, or a redirect from a page.
  prerenderConflictBehavior: "error",
  // Build hooks run in this order: singleSitemap() reads sitemap()'s output.
  integrations: [sitemap(), singleSitemap()],
});
