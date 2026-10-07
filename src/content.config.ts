import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
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
 * Blog posts: one Markdown file per post under `src/content/posts/`, in a
 * folder with its images when it has any, or `.mdx` when it uses a
 * component. The entry's id is its `slug`, and its page is `/blog/<slug>`.
 */
const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
    // Rendered when a page renders the post, where an error in the Markdown
    // pipeline, such as an unknown directive, fails the build. Rendered
    // while the collection loads, the error is only logged.
    deferRender: true,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** The post's URL is `/blog/<slug>`; it never changes once published. */
      slug: z.string(),
      /** One or two sentences for lists, search results and shared links. */
      description: z.string().min(1),
      date: z.coerce.date(),
      /** Keys of `src/content/authors.yml`. */
      authors: z.array(z.string()).min(1),
      /** Keys of `src/content/tags.yml`. */
      tags: z.array(z.string()).default([]),
      /** The series the post belongs to, and its place in it. */
      series: z.string().optional(),
      part: z.number().int().positive().optional(),
      /** An image next to the post that replaces its generated cover. */
      cover: image().optional(),
      /** A draft shows in the dev server only, never in a build. */
      draft: z.boolean().default(false),
    }),
});

/** The authors of blog posts, by key, with the keys of Docusaurus's `authors.yml`. */
const authors = defineCollection({
  loader: file("./src/content/authors.yml"),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    url: z.url(),
    /** The author's picture. */
    image_url: z.url(),
    /** Whether the author has a page at `/blog/authors/<key>`. */
    page: z.boolean().default(false),
    socials: z.record(z.string(), z.string()).default({}),
  }),
});

/** The tags of blog posts, by key, with the keys of Docusaurus's `tags.yml`. */
const tags = defineCollection({
  loader: file("./src/content/tags.yml"),
  schema: z.object({
    label: z.string(),
    /** The tag's page is `/blog/tags<permalink>`. */
    permalink: z.string().startsWith("/"),
    description: z.string(),
  }),
});

export const collections = { useCases, features, posts, authors, tags };
