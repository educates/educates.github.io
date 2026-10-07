import { defineCollection, type SchemaContext } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { jobIds } from "./lib/features.ts";
import {
  outsideContentKinds,
  outsideEntryProblems,
} from "./lib/outside-content.ts";

/** A short point on a use case page: a title and a sentence or two. */
const useCasePoint = z.object({
  title: z.string(),
  text: z.string(),
});

/**
 * A short muted recording on a Feature's deep page: what it shows and, once
 * it is captured, its video and poster, named relative to the entry like an
 * image. Until then the page shows a placeholder loop.
 */
const featureLoop = (image: SchemaContext["image"]) =>
  z
    .object({
      /**
       * What the recording shows, in a sentence: its accessible name, and
       * until it is captured, what to capture.
       */
      alt: z.string(),
      /** The video, an MP4 or WebM file, such as `./clickable-actions/run.mp4`. */
      video: z.string().optional(),
      /** The frame shown before it plays. */
      poster: image().optional(),
    })
    .refine(
      (loop) => (loop.video === undefined) === (loop.poster === undefined),
      {
        message:
          "a loop needs both its video and its poster, or neither until it is captured",
      },
    );

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
    /**
     * The line icon on its homepage tile, by its name in
     * src/components/Icon.astro.
     */
    icon: z.enum(["calendar", "presentation", "people", "layers"]),
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
           * Features overview, a section of the page itself, such as
           * `#how-it-works`, or an Example: something built on Educates
           * outside the project's own publications, such as a site or a
           * repository to study.
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
                  "Example",
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
 * A flagship with a `page` has its deep page on the deep page template,
 * src/layouts/FeatureLayout.astro, and its Markdown body is the page's "How
 * you use it" section: the real snippet that turns the Feature on, from the
 * docs. A flagship without a `page` is a stub.
 *
 * The site describes the Educates release current at launch: copy, snippets
 * and docs links hold against that release's docs, or for a tool outside
 * the platform, against the README of its repository.
 */
const features = defineCollection({
  loader: glob({
    pattern: "*.{md,mdx}",
    base: "./src/content/features",
    // Rendered when its deep page renders, where an error in the Markdown
    // pipeline fails the build.
    deferRender: true,
  }),
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
      /** A flagship's deep page, in the template's order. */
      page: z
        .object({
          /** The page's heading: what the Feature does for the reader. */
          headline: z.string(),
          /**
           * Other Features the page covers in full, by their ids, such as
           * the portal REST API on the lookup service's page. Their use
           * cases are listed with the Feature's own, and their blocks on
           * the overview link here.
           */
          covers: z.array(z.string()).default([]),
          /** What it is: a paragraph below the headline. */
          what: z.string(),
          /** The recording beside it, of the Feature at work. */
          loop: featureLoop(image),
          /**
           * Three to five things you can do with it, each with a
           * screenshot (`visual`) or a recording (`loop`). One with
           * neither shows a placeholder frame until it is captured.
           */
          things: z
            .array(
              useCasePoint.extend({
                visual: z.object({ src: image(), alt: z.string() }).optional(),
                loop: featureLoop(image).optional(),
              }),
            )
            .min(3)
            .max(5),
          /**
           * Its limits, in the voice of a use case's "What you bring": what
           * it does not do, and what it needs from you, each with the docs
           * page that says so where there is one.
           */
          limits: z
            .array(useCasePoint.extend({ docs: z.url().optional() }))
            .min(1),
          /**
           * Workshops to deploy from the Hub that show it, by their ids in
           * src/content/hub-workshops.yml.
           */
          hubWorkshops: z.array(z.string()).default([]),
          /**
           * Repositories on GitHub to try it from, for a tool outside the
           * platform, such as the AI authoring skills: each as owner/name,
           * with a line on what it holds. See `repositoryLinks()` in
           * src/lib/repositories.ts.
           */
          repositories: z
            .array(z.object({ name: z.string(), text: z.string() }))
            .default([]),
          /** What to read next: docs sections, Blog posts and guides. */
          reading: z
            .array(
              z.object({
                title: z.string(),
                href: z.string(),
                kind: z.enum(["Docs", "Blog post", "Guide"]),
              }),
            )
            .min(1),
        })
        .optional(),
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
    /**
     * A part's tags, keys of `src/content/tags.yml`, which give its card on
     * the Learn page its Topics.
     */
    tags: z.array(z.string()).default([]),
    /**
     * Whether the part is a signpost to what comes after the path, such as
     * Next steps, rather than a step of it. The Learn page lists a card for
     * every other part.
     */
    signpost: z.boolean().default(false),
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
    z
      .object({
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
        /**
         * The name of the series the post belongs to, the same on every
         * part, and its place in it, from 1. Once two parts are published,
         * each shows a box listing the parts (see `seriesOf()` in
         * src/lib/post-series.ts).
         */
        series: z.string().optional(),
        part: z.number().int().positive().optional(),
        /** An image next to the post that replaces its generated cover. */
        cover: image().optional(),
        /** A draft shows in the dev server only, never in a build. */
        draft: z.boolean().default(false),
      })
      .refine(
        (post) => (post.series === undefined) === (post.part === undefined),
        {
          message: "a post in a series needs both `series` and `part`",
          path: ["series"],
        },
      ),
});

/**
 * Outside Content: videos, talks and articles published somewhere other
 * than this site, one YAML file per entry under
 * `src/content/outside-content/`, its images next to it. The file name is
 * the entry's id. Entries link out, and the YouTube facade in posts plays
 * their videos. `outsideEntryProblems()` in src/lib/outside-content.ts
 * holds the rules that span fields, such as the poster every video from
 * the project's channel needs; an entry that breaks one fails the build.
 */
const outsideContent = defineCollection({
  loader: glob({
    pattern: "*.{yml,yaml}",
    base: "./src/content/outside-content",
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        kind: z.enum(outsideContentKinds),
        /** Where it is published, which its card links to. */
        url: z.url(),
        /** When it was published, or for a talk, given. */
        date: z.coerce.date(),
        /** The event a talk was given at. */
        event: z.string().optional(),
        /**
         * The YouTube channel a video or talk is on, by its handle, such as
         * `@EducatesTrainingPlatform`.
         */
        channel: z.string().optional(),
        /** Keys of `src/content/tags.yml`. */
        tags: z.array(z.string()).default([]),
        /** One line for its card. */
        description: z.string().min(1),
        /** Who wrote an article, as its cover's byline names them. */
        author: z.string().optional(),
        /**
         * An image next to the entry, which the project has the right to
         * use, that replaces its generated cover.
         */
        cover: image().optional(),
        /** A video's or talk's length, recorded by hand: `m:ss` or `h:mm:ss`. */
        length: z
          .string()
          .regex(/^(\d+:)?\d{1,2}:\d{2}$/)
          .optional(),
        /**
         * The YouTube thumbnail of a video from the project's channel, next
         * to the entry. `npm run posters` downloads it and adds this field.
         */
        poster: image().optional(),
      })
      .superRefine((entry, context) => {
        for (const { field, message } of outsideEntryProblems(entry)) {
          context.addIssue({ code: "custom", path: [field], message });
        }
      }),
});

/**
 * The Topics the Learn page filters by, in src/content/topics.yml, keyed by
 * the id its query string uses. Each is a set of tags; `topics()` in
 * src/lib/content.ts lists them by `order` and fails the build on a tag
 * `src/content/tags.yml` does not define.
 */
const topics = defineCollection({
  loader: file("./src/content/topics.yml"),
  schema: z.object({
    /** The Topic's name, as its chip and the cards show it. */
    label: z.string(),
    /** Keys of `src/content/tags.yml`. */
    tags: z.array(z.string()).min(1),
    /** Where its chip sits, lowest first; cards list Topics in this order. */
    order: z.number().int(),
  }),
});

/** The authors of blog posts, by key, with the keys of Docusaurus's `authors.yml`. */
const authors = defineCollection({
  loader: file("./src/content/authors.yml"),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      title: z.string(),
      url: z.url(),
      /**
       * The author's picture, kept in the repository so a post loads
       * nothing from another site: a path from `authors.yml`.
       */
      image: image(),
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
  outsideContent,
  topics,
  authors,
  tags,
};
