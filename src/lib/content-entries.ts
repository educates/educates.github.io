// Content of every kind as one shape: blog posts, the guides' parts, and
// outside videos, talks and articles. The Learn page lists these entries
// and filters them by kind and Topic, the homepage shows the first
// Featured ones, and a post's Related Content shares a Topic with it.
// `contentEntries()` in src/lib/content.ts builds them from the
// collections.

import type { ImageMetadata } from "astro";
import type { CoverProps } from "./cover.ts";
import type { FacetedEntry, FacetGroup } from "./facet-filter.ts";

/**
 * A Topic: a curated subject the Learn page filters by, defined in
 * src/content/topics.yml as a set of blog tags.
 */
export interface Topic {
  /** How the query string names it, such as `working-locally`. */
  id: string;
  label: string;
  /** The tags it groups, keys of src/content/tags.yml. */
  tags: readonly string[];
}

/** The kinds of Content, as the Learn page's kind chips name them. */
export const contentKinds = [
  { id: "posts", label: "Blog posts" },
  { id: "guides", label: "Guides" },
  { id: "videos", label: "Videos and talks" },
  { id: "articles", label: "Articles" },
] as const;

export type ContentKind = (typeof contentKinds)[number]["id"];

/** One piece of Content, with what its card shows. */
export interface ContentEntry {
  /**
   * The entry's collection folder under src/content and its id there:
   * `posts/<slug>`, `guides/<part>` or `outside-content/<file name>`. The
   * Featured Content list names entries by it.
   */
  id: string;
  kind: ContentKind;
  /** The kind as its card names it, such as "Blog post" or "Talk". */
  label: string;
  /** A page on the site, or for an outside entry, its URL. */
  href: string;
  title: string;
  /**
   * For an outside entry in a language other than English, that language
   * as a BCP 47 tag, such as `es`. Its card marks the title with it.
   */
  lang?: string;
  /** One line for its card. */
  description: string;
  /** When it was published or given; guides have none. */
  date?: Date;
  /** A post's reading time, or a video's or talk's length. */
  length?: string;
  /** Its Topics, from its tags, in the Topics' order. */
  topics: readonly Topic[];
  /** For an outside entry, the event, channel or site it comes from. */
  source?: string;
  /** What its generated cover draws. */
  cover: CoverProps;
  /** Its own cover image, which replaces the generated cover. */
  coverImage?: ImageMetadata;
}

/** The Topics that group any of `tags`, in the Topics' order. */
export function topicsOf(
  tags: readonly string[],
  topics: readonly Topic[],
): Topic[] {
  return topics.filter((topic) => topic.tags.some((tag) => tags.includes(tag)));
}

/**
 * The entries in the Learn page's order: the dated ones newest first, then
 * the guides, which have no date, in the order given.
 */
export function learnOrder(entries: readonly ContentEntry[]): ContentEntry[] {
  const dated = entries.filter((entry) => entry.date !== undefined);
  const undated = entries.filter((entry) => entry.date === undefined);
  return [
    ...dated.sort((a, b) => b.date!.getTime() - a.date!.getTime()),
    ...undated,
  ];
}

/**
 * The entries `ids` names, in its order. An id that names no entry fails
 * the build.
 */
export function featuredEntries(
  ids: readonly string[],
  entries: readonly ContentEntry[],
): ContentEntry[] {
  return ids.map((id) => {
    const found = entries.find((candidate) => candidate.id === id);
    if (!found) {
      throw new Error(
        `Featured Content names "${id}", which is no Content entry: an id is posts/<slug>, guides/<part> or outside-content/<file name>`,
      );
    }
    return found;
  });
}

/**
 * Up to `count` other entries that share a Topic with `entry`, in the
 * order of `entries`.
 */
export function relatedEntries(
  entry: ContentEntry,
  entries: readonly ContentEntry[],
  count = 3,
): ContentEntry[] {
  const own = new Set(entry.topics.map((topic) => topic.id));
  return entries
    .filter(
      (candidate) =>
        candidate.id !== entry.id &&
        candidate.topics.some((topic) => own.has(topic.id)),
    )
    .slice(0, count);
}

/** The Learn page's two facet groups: kind, and Topic. */
export function learnFacetGroups(topics: readonly Topic[]): FacetGroup[] {
  return [
    { id: "kind", label: "Kind", values: [...contentKinds] },
    {
      id: "topic",
      label: "Topic",
      values: topics.map(({ id, label }) => ({ id, label })),
    },
  ];
}

/** An entry as the Learn page's filter sees it: its kind and its Topics. */
export function contentFacets(entry: ContentEntry): FacetedEntry {
  return {
    id: entry.id,
    facets: {
      kind: [entry.kind],
      topic: entry.topics.map((topic) => topic.id),
    },
  };
}
