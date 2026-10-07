import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { jobIds } from "./lib/features.ts";

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
 * file name is the entry's slug. Every Feature is a block on `/features`,
 * under its job. A flagship Feature also has a deep page at
 * `/features/<slug>`, listed in the header menu and the footer.
 *
 * The site describes the Educates release current at launch: copy and docs
 * links hold against that release's docs, or for a tool outside the
 * platform, against the README of its repository.
 */
const features = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/features" }),
  schema: ({ image }) =>
    z.object({
      /** The Feature's name, as menus and the overview show it. */
      name: z.string(),
      /** The job it serves, which groups it on the overview and the homepage. */
      job: z.enum(jobIds),
      /** One sentence of what you see or do with it. */
      sentence: z.string(),
      /**
       * The sentence to show instead once Educates 4.0 is released, for a
       * Feature that 4.0 extends with parts of its own, such as Helm and
       * GitOps install. `site.educates4Released` switches to it.
       */
      educates4Sentence: z.string().optional(),
      /**
       * Whether the whole Feature exists only from Educates 4.0, such as
       * air-gapped install. It is hidden everywhere until
       * `site.educates4Released` is on.
       */
      educates4Only: z.boolean().default(false),
      /**
       * Where its documentation is: a docs.educates.dev page or section, or
       * for a tool outside the platform, its repository.
       */
      docs: z.url(),
      /**
       * A screenshot of the Feature at work, read from a file next to the
       * entry. A Feature without one shows a placeholder frame.
       */
      visual: z.object({ src: image(), alt: z.string() }).optional(),
      /** Whether it has a deep page of its own. */
      flagship: z.boolean().default(false),
      /**
       * Where it sits in lists, lowest first: among its job's Features on
       * the overview, and among the flagships in the header menu and the
       * footer.
       */
      order: z.number().int(),
      /**
       * Its place, 1 to 4, among its job's Features on the homepage. A
       * Feature without one is not on the homepage.
       */
      homepage: z.number().int().min(1).max(4).optional(),
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
