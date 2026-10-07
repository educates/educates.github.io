import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Use cases: one Markdown file per page under `src/content/use-cases/`. The
 * file name is the entry's slug, its page is `/use-cases/<slug>`, and the
 * header menu, the footer and the homepage tiles list the entries by
 * `order`.
 */
const useCases = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/use-cases" }),
  schema: z.object({
    /** The use case's name, as menus and tiles show it. */
    name: z.string(),
    /** The one-line promise to the reader, shown on its homepage tile. */
    promise: z.string(),
    /** Where it sits in menus and lists, lowest first. */
    order: z.number().int(),
  }),
});

/**
 * Features: one Markdown file per Feature under `src/content/features/`. The
 * file name is the entry's slug. A flagship Feature has a deep page at
 * `/features/<slug>`, listed in the header menu and the footer by `order`.
 */
const features = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/features" }),
  schema: z.object({
    /** The Feature's name, as menus and the overview show it. */
    name: z.string(),
    /** The job it serves, which groups it on the overview and the homepage. */
    job: z.enum(["authoring", "delivering", "operating"]),
    /** One sentence of what you see or do with it. */
    sentence: z.string(),
    /** Whether it has a deep page of its own. */
    flagship: z.boolean().default(false),
    /** Where it sits in menus and lists, lowest first. */
    order: z.number().int(),
  }),
});

/**
 * The Getting Started Guides: one Markdown or MDX page per file under
 * `src/content/guides/`, served at `/getting-started-guides/<path>`.
 * `index.md` is the overview. Every other top-level page is a part of the
 * path, numbered by `order`; a part with pages inside it is a folder with
 * an `index.md`, and its pages follow it in `order`. `guidePath()` in
 * src/lib/guide-path.ts arranges them.
 */
const guides = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
  schema: z.object({
    /** The page's heading and title. */
    title: z.string(),
    /** One or two sentences for search results and shared links. */
    description: z.string(),
    /** Where it sits among the parts, or among its part's pages. */
    order: z.number().int(),
  }),
});

export const collections = { useCases, features, guides };
