import { getImage } from "astro:assets";
import { getCollection, type CollectionEntry } from "astro:content";
import { site } from "../site.ts";
import { aboutSection } from "./about-section.ts";
import {
  featuredEntries,
  learnOrder,
  relatedEntries,
  topicsOf,
  type ContentEntry,
  type Topic,
} from "./content-entries.ts";
export type { ContentEntry, Topic } from "./content-entries.ts";
import { featuredContentIds } from "./featured-content.ts";
import { currentFeatures, featureLinks } from "./features.ts";
import { guidePath } from "./guide-path.ts";
import { hubWorkshopLinks } from "./hub-workshops.ts";
import { isProjectVideo, youTubeVideoId } from "./outside-content.ts";
import {
  postCover,
  postPath,
  postReadingMinutes,
  posts,
  tagsByKey,
} from "./posts.ts";

export { featurePath } from "./features.ts";

/** The Getting Started Guides' pages, and the path they make. */
export async function guides() {
  const entries = await getCollection("guides");
  const path = guidePath(
    entries.map((entry) => ({
      id: entry.id,
      title: entry.data.title,
      order: entry.data.order,
    })),
  );
  return { entries, path };
}

/** The About Educates pages, and the section they make. */
export async function aboutPages() {
  const entries = await getCollection("about");
  const section = aboutSection(
    entries.map((entry) => ({
      id: entry.id,
      title: entry.data.title,
      order: entry.data.order,
    })),
  );
  return { entries, section };
}

/** The use cases, in their menu order. */
export async function useCases() {
  return (await getCollection("useCases")).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/**
 * The Features of the release the site describes (see `currentFeatures()`
 * and `site.educates4Released`), in their menu order. Group them with
 * `featuresByJob()` or `homepageFeaturesByJob()` from `./features.ts`.
 */
export async function features() {
  return currentFeatures(await getCollection("features"), site).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/** The flagship Features, the ones with a deep page, in their menu order. */
export async function flagshipFeatures() {
  return (await features()).filter((feature) => feature.data.flagship);
}

/** The URL path of a use case's page. */
export function useCasePath(slug: string): string {
  return `/use-cases/${slug}`;
}

/**
 * Links to the Features named by `ids`, in that order: a flagship's deep
 * page, or any other Feature's block on the overview. A Feature the site
 * does not show fails the build; `usedBy` names who named it.
 */
export async function featureLinksFor(ids: readonly string[], usedBy: string) {
  return featureLinks(ids, await features(), usedBy);
}

/**
 * The Hub workshops named by `ids`, in that order, with their titles and
 * hub.educates.dev URLs from src/content/hub-workshops.yml. An id the file
 * does not define fails the build; `usedBy` names who named it.
 */
export async function hubWorkshops(ids: readonly string[], usedBy: string) {
  const links = (await getCollection("hubWorkshops")).map((entry) => ({
    id: entry.id,
    ...entry.data,
  }));
  return hubWorkshopLinks(ids, links, usedBy);
}

/**
 * The outside Content entry of the YouTube video `videoId`, which holds its
 * title, URL and poster. A video without one fails the build; `usedBy`
 * names who showed it.
 */
export async function youTubeVideo(videoId: string, usedBy: string) {
  const entry = (await getCollection("outsideContent")).find(
    (candidate) => youTubeVideoId(candidate.data.url) === videoId,
  );
  if (!entry) {
    throw new Error(
      `${usedBy}: YouTube video ${videoId} has no outside Content entry; add one under src/content/outside-content/`,
    );
  }
  return entry;
}

/**
 * The Topics, in the order of the Learn page's chips. A tag that
 * src/content/tags.yml does not define fails the build.
 */
export async function topics(): Promise<Topic[]> {
  const entries = await getCollection("topics");
  await checkTags(
    entries.flatMap((entry) => entry.data.tags),
    "src/content/topics.yml",
  );
  return entries
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      id: entry.id,
      label: entry.data.label,
      tags: entry.data.tags,
    }));
}

/** The built entries, kept for the rest of a build. */
let built: Promise<ContentEntry[]> | undefined;

/**
 * Every piece of Content the Learn page lists, in its order (see
 * `learnOrder()`): the published blog posts, the parts of the Getting
 * Started Guides' path except its signposts, and the outside videos, talks
 * and articles. About Educates and Hub workshops are not Content. A tag
 * that src/content/tags.yml does not define fails the build.
 */
export function contentEntries(): Promise<ContentEntry[]> {
  // The dev server builds them on every request, so edits show.
  if (import.meta.env.DEV) return buildContentEntries();
  built ??= buildContentEntries();
  return built;
}

/**
 * The first `count` entries of the Featured Content list in
 * src/lib/featured-content.ts: what the homepage shows and the Learn page
 * pins. An id that names no entry fails the build.
 */
export async function featuredContent(count = 3): Promise<ContentEntry[]> {
  return featuredEntries(featuredContentIds, await contentEntries()).slice(
    0,
    count,
  );
}

/**
 * Up to `count` entries sharing a Topic with the entry `id`, such as
 * `posts/<slug>`, in the Learn page's order.
 */
export async function relatedContent(
  id: string,
  count = 3,
): Promise<ContentEntry[]> {
  const entries = await contentEntries();
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`No Content entry "${id}"`);
  return relatedEntries(entry, entries, count);
}

async function buildContentEntries(): Promise<ContentEntry[]> {
  const known = await topics();
  const entries = await Promise.all([
    postEntries(known),
    guideEntries(known),
    outsideEntries(known),
  ]);
  return learnOrder(entries.flat());
}

async function postEntries(known: Topic[]): Promise<ContentEntry[]> {
  return Promise.all(
    (await posts()).map(async (post) => {
      await checkTags(post.data.tags, post.filePath);
      return {
        id: `posts/${post.id}`,
        kind: "posts",
        label: "Blog post",
        href: postPath(post),
        title: post.data.title,
        description: post.data.description,
        date: post.data.date,
        length: `${postReadingMinutes(post)} min read`,
        topics: topicsOf(post.data.tags, known),
        cover: await postCover(post),
        coverImage: post.data.cover,
      } satisfies ContentEntry;
    }),
  );
}

/** A card for each part of the guides' path, in its order, but signposts. */
async function guideEntries(known: Topic[]): Promise<ContentEntry[]> {
  const { entries, path } = await guides();
  const steps = path.sidebar.items.map((item, index) => ({
    marker: item.marker ?? String(index + 1),
    label: item.label,
  }));
  const parts = entries
    .flatMap((entry) => {
      const part = path.partOf(entry.id);
      const isPart = part !== undefined && !entry.id.includes("/");
      return isPart && !entry.data.signpost ? [{ entry, part }] : [];
    })
    .sort((a, b) => a.part.number - b.part.number);
  return Promise.all(
    parts.map(async ({ entry, part }) => {
      await checkTags(entry.data.tags, entry.filePath);
      return {
        id: `guides/${entry.id}`,
        kind: "guides",
        label: `Guide · Part ${part.number}`,
        href: path.href(entry.id),
        title: entry.data.title,
        description: entry.data.description,
        topics: topicsOf(entry.data.tags, known),
        cover: {
          form: "guide",
          title: entry.data.title,
          part: part.number,
          steps,
        },
      } satisfies ContentEntry;
    }),
  );
}

async function outsideEntries(known: Topic[]): Promise<ContentEntry[]> {
  return Promise.all(
    (await getCollection("outsideContent")).map(async (entry) => {
      const { data } = entry;
      await checkTags(data.tags, entry.filePath);
      const source = outsideSource(entry);
      const common = {
        id: `outside-content/${entry.id}`,
        href: data.url,
        title: data.title,
        description: data.description,
        date: data.date,
        topics: topicsOf(data.tags, known),
        source,
        coverImage: data.cover,
      };
      if (data.kind === "article") {
        const address = new URL(data.url);
        return {
          ...common,
          kind: "articles",
          label: "Article",
          cover: {
            form: "article",
            title: data.title,
            date: data.date,
            address: `${address.host}${address.pathname}`,
            source,
            // The schema requires an article's author.
            author: data.author!,
            description: data.description,
          },
        } satisfies ContentEntry;
      }
      // Only a video from the project's channel has a poster.
      const poster =
        data.poster && isProjectVideo(data)
          ? (await getImage({ src: data.poster, width: 640, format: "webp" }))
              .src
          : undefined;
      return {
        ...common,
        kind: "videos",
        label: data.kind === "talk" ? "Talk" : "Video",
        // The schema requires a video's or talk's length.
        length: data.length!,
        cover: {
          form: "video",
          title: data.title,
          date: data.date,
          length: data.length!,
          source,
          ...(poster && { poster }),
          ...(data.kind === "talk" && { talk: true }),
        },
      } satisfies ContentEntry;
    }),
  );
}

/**
 * Where an outside entry comes from, as its card names it: a talk's event,
 * a video's YouTube channel, or an article's site.
 */
function outsideSource({ data }: CollectionEntry<"outsideContent">): string {
  const channel = data.channel && `YouTube, ${data.channel.replace(/^@/, "")}`;
  const host = new URL(data.url).hostname.replace(/^www\./, "");
  if (data.kind === "talk") return data.event ?? channel ?? host;
  if (data.kind === "video") return channel ?? data.event ?? host;
  return host;
}

/** Fails the build on a tag src/content/tags.yml does not define. */
async function checkTags(tags: readonly string[], usedBy: string | undefined) {
  const defined = await tagsByKey();
  for (const tag of tags) {
    if (!defined.has(tag)) {
      throw new Error(
        `${usedBy ?? "A Content entry"} has tag "${tag}", which src/content/tags.yml does not define`,
      );
    }
  }
}
