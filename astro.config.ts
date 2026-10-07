import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import mermaid from "astro-mermaid";
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
  // Two routes building the same URL fail the build, such as a redirect
  // from a page that still exists.
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
  // ec.config.mjs, must come before mdx() to render code blocks in MDX too.
  // mermaid() turns each `mermaid` fence in Markdown into a
  // <pre class="mermaid"> that Mermaid renders in the browser, in the theme
  // `data-theme` names; it comes after expressiveCode() and adds its plugin
  // to the processor above. A `mermaid` fence in MDX fails the build unless
  // the processor's `rawHtml` feature is on. react() renders the islands;
  // singleSitemap() reads sitemap()'s output; openGraphImages() draws every
  // page's Open Graph image from the built pages.
  integrations: [
    expressiveCode(),
    mermaid({ enableLog: false }),
    mdx(),
    react(),
    sitemap(),
    singleSitemap(),
    openGraphImages({ origin: site.origin }),
  ],
});
