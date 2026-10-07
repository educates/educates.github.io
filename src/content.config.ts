import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { jobIds } from "./lib/features.ts";

/** A short point on a use case page: a title and a sentence or two. */
const useCasePoint = z.object({
  title: z.string(),
  text: z.string(),
});

/**
 * Use cases: one Markdown file per page under `src/content/use-cases/`. The
 * file name is the entry's slug, its page is `/use-cases/<slug>`, and the
 * header menu, the footer and the homepage tiles list the entries by
 * `order`.
 *
 * A use case with a `page` has its page on the use case template,
 * src/layouts/UseCaseLayout.astro, and its Markdown body is the page's "How
 * it works" section, for the Builder: a short flow or a `mermaid` diagram,
 * linking to docs.educates.dev. A use case without a `page` is a stub.
 * Every claim holds against the docs of the release the site describes.
 */
const useCases = defineCollection({
  loader: glob({
    pattern: "*.{md,mdx}",
    base: "./src/content/use-cases",
    // Rendered when its page renders, where an error in the Markdown
    // pipeline fails the build.
    deferRender: true,
  }),
  schema: z.object({
    /** The use case's name, as menus and tiles show it. */
    name: z.string(),
    /** The one-line promise to the reader, shown on its homepage tile. */
    promise: z.string(),
    /** Where it sits in menus and lists, lowest first. */
    order: z.number().int(),
    /** The page's sections, in the template's order. */
    page: z
      .object({
        /** The outcome, as the page's heading: what the decision maker gets. */
        headline: z.string(),
        /** Who the page is for, in one line. */
        reader: z.string(),
        /** One or two sentences below the headline. */
        lede: z.string(),
        /**
         * The main call to action at the top of the page: "Get started", or
         * "Get help building yours" for a use case built with the team's
         * help. "Get started" and "Get help" close every page.
         */
        lead: z
          .enum(["get-started", "get-help-building"])
          .default("get-started"),
        /** The problem: two or three pains the reader has today. */
        problems: z.array(useCasePoint).min(2).max(3),
        /**
         * How Educates fits: three or four capabilities, each naming the
         * Features it rests on by their ids in src/content/features/.
         * A capability that Educates 4.0 extends adds `educates4Text`,
         * `educates4Features` or both, which `site.educates4Released`
         * switches to (see `currentCapabilities()` in
         * src/lib/use-cases.ts); until then they stay hidden.
         */
        capabilities: z
          .array(
            useCasePoint.extend({
              features: z.array(z.string()).min(1),
              educates4Text: z.string().optional(),
              educates4Features: z.array(z.string()).min(1).optional(),
            }),
          )
          .min(3)
          .max(4),
        /**
         * What you bring: what Educates does not do for this use case, each
         * with the docs page that says so where there is one.
         */
        bring: z
          .array(useCasePoint.extend({ docs: z.url().optional() }))
          .min(1),
        /** Proof: what backs the page's claims. */
        proof: z.object({
          /** A figure or fact with the page that records it. */
          facts: z
            .array(
              z.object({
                figure: z.string(),
                text: z.string(),
                source: z.object({ label: z.string(), href: z.string() }),
              }),
            )
            .default([]),
          /**
           * What to read, by title and URL: Content, docs pages, the
           * Features overview, or a section of the page itself, such as
           * `#how-it-works`.
           */
          content: z
            .array(
              z.object({
                title: z.string(),
                href: z.string(),
                kind: z.enum([
                  "Blog post",
                  "Guide",
                  "About Educates",
                  "Features",
                  "Docs",
                  "On this page",
                ]),
              }),
            )
            .default([]),
          /**
           * Workshops to deploy from the Hub, by their ids in
           * src/content/hub-workshops.yml.
           */
          hubWorkshops: z.array(z.string()).default([]),
          /**
           * Anonymized customer stories. A story is published only once its
           * company has cleared it, on the date in `cleared`; the page reads
           * complete without one.
           */
          stories: z
            .array(
              z.object({
                title: z.string(),
                text: z.string(),
                cleared: z.coerce.date(),
              }),
            )
            .default([]),
        }),
      })
      .optional(),
  }),
});

/**
 * Workshops on the Educates Hub that the site links to, in
 * src/content/hub-workshops.yml, keyed by id. Pages name them by id and
 * never write a Hub URL into their copy; `hubWorkshops()` in
 * src/lib/content.ts looks them up and fails the build on an unknown id.
 */
const hubWorkshops = defineCollection({
  loader: file("./src/content/hub-workshops.yml"),
  schema: z.object({
    /** The workshop's title, as the Hub shows it. */
    title: z.string(),
    /** The workshop's page on the Hub. */
    url: z.url().refine((url) => url.startsWith("https://hub.educates.dev/"), {
      message: "must be a page on https://hub.educates.dev/",
    }),
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
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/guides",
    // Rendered when a page renders the guide, where an error in the
    // Markdown pipeline, such as an unknown directive, fails the build.
    deferRender: true,
  }),
  schema: z.object({
    /** The page's heading and title. */
    title: z.string(),
    /** One or two sentences for search results and shared links. */
    description: z.string(),
    /** Where it sits among the parts, or among its part's pages. */
    order: z.number().int(),
  }),
});

/**
 * About Educates: one Markdown page per file under `src/content/about/`,
 * served at `/about-educates/<name>`. `index.md` is Architecture, at
 * `/about-educates`. The sidebar lists the pages by `order`;
 * `aboutSection()` in src/lib/about-section.ts arranges them. A `mermaid`
 * fence in a page becomes a diagram.
 */
const about = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "./src/content/about",
    // Rendered when a page renders, where an error in the Markdown
    // pipeline, such as an unknown directive, fails the build.
    deferRender: true,
  }),
  schema: z.object({
    /** The page's heading and title. */
    title: z.string(),
    /** One or two sentences for search results and shared links. */
    description: z.string(),
    /** Where it sits in the section's sidebar. */
    order: z.number().int(),
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

export const collections = {
  useCases,
  hubWorkshops,
  features,
  guides,
  about,
  posts,
  authors,
  tags,
};
