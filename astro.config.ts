import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
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
  integrations: [sitemap()],
});
