import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import { openGraphImages } from "./src/integrations/open-graph-images.ts";
import { singleSitemap } from "./src/integrations/single-sitemap.ts";
import { admonitions } from "./src/markdown/admonitions.ts";
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
  // Markdown and MDX share this pipeline.
  markdown: {
    processor: satteri({
      features: {
        // Admonitions, the `:::type` blocks.
        directive: true,
        // Content keeps its punctuation as written: `--` in prose stays two
        // hyphens and quotes stay straight, as on the Docusaurus site.
        smartPunctuation: false,
      },
      mdastPlugins: [admonitions()],
    }),
  },
  // Integrations run in this order. expressiveCode(), configured in
  // ec.config.mjs, must come before mdx() to render code blocks in MDX too;
  // react() renders the islands; singleSitemap() reads sitemap()'s output;
  // openGraphImages() draws every page's Open Graph image from the built
  // pages.
  integrations: [
    expressiveCode(),
    mdx(),
    react(),
    sitemap(),
    singleSitemap(),
    openGraphImages({ origin: site.origin }),
  ],
});
