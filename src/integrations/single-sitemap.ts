import { readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

/**
 * Turns the output of `@astrojs/sitemap`, which is always an index plus
 * numbered parts, into the one `/sitemap.xml` the site has always served:
 * it renames `sitemap-0.xml` to `sitemap.xml` and deletes the index. List
 * it after `sitemap()`, since integrations run their build hooks in order.
 */
export function singleSitemap(): AstroIntegration {
  return {
    name: "single-sitemap",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await readdir(root);
        const parts = files.filter((file) => /^sitemap-\d+\.xml$/.test(file));
        if (!files.includes("sitemap-index.xml") || parts.length === 0) {
          throw new Error(
            "single-sitemap found no sitemap output; list it after sitemap() in the Astro config",
          );
        }
        if (parts.length > 1) {
          throw new Error(
            `the sitemap has ${parts.length} parts, and /sitemap.xml holds only one`,
          );
        }
        await rename(join(root, parts[0]), join(root, "sitemap.xml"));
        await rm(join(root, "sitemap-index.xml"));
        logger.info("`sitemap.xml` created from `sitemap-0.xml`");
      },
    },
  };
}
