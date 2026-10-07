// Blog posts, their authors and their tags, from the content collections,
// and the URL paths of the pages that show them.

import { getCollection, type CollectionEntry } from "astro:content";
import { readingMinutes } from "./reading-time.ts";

export type Post = CollectionEntry<"posts">;
export type Author = CollectionEntry<"authors">;
export type Tag = CollectionEntry<"tags">;

/** The blog's own page, the first of its list. */
export const blogPath = "/blog";

/**
 * The posts the site publishes, newest first. Drafts are left out of every
 * build and show only in the dev server.
 */
export async function posts(): Promise<Post[]> {
  const entries = await getCollection(
    "posts",
    (entry) => import.meta.env.DEV || !entry.data.draft,
  );
  return entries.sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id),
  );
}

/** The URL path of a post's page. */
export function postPath(post: Post): string {
  return `${blogPath}/${post.id}`;
}

/** How many minutes a post takes to read. */
export function postReadingMinutes(post: Post): number {
  return readingMinutes(post.body ?? "");
}

/** Every author, by key. */
export async function authorsByKey(): Promise<Map<string, Author>> {
  return new Map(
    (await getCollection("authors")).map((author) => [author.id, author]),
  );
}

/** Every tag, by key. */
export async function tagsByKey(): Promise<Map<string, Tag>> {
  return new Map((await getCollection("tags")).map((tag) => [tag.id, tag]));
}

/**
 * The authors of a post, in its order. An author key missing from
 * `src/content/authors.yml` fails the build.
 */
export async function postAuthors(post: Post): Promise<Author[]> {
  const authors = await authorsByKey();
  return post.data.authors.map((key) => {
    const author = authors.get(key);
    if (!author) {
      throw new Error(
        `Post ${post.filePath} names author "${key}", which src/content/authors.yml does not define`,
      );
    }
    return author;
  });
}

/**
 * The tags of a post, in its order. A tag key missing from
 * `src/content/tags.yml` fails the build.
 */
export async function postTags(post: Post): Promise<Tag[]> {
  const tags = await tagsByKey();
  return post.data.tags.map((key) => {
    const tag = tags.get(key);
    if (!tag) {
      throw new Error(
        `Post ${post.filePath} has tag "${key}", which src/content/tags.yml does not define`,
      );
    }
    return tag;
  });
}

/** The URL path of the index of every tag. */
export const tagsPath = `${blogPath}/tags`;

/** The URL path of a tag's first page of posts. */
export function tagPath(tag: Tag): string {
  return `${tagsPath}${tag.data.permalink}`;
}

/** The URL path of the index of every author. */
export const authorsPath = `${blogPath}/authors`;

/** The URL path of an author's first page of posts. */
export function authorPath(author: Author): string {
  return `${authorsPath}/${author.id}`;
}

/** The URL path of the list of every post by year. */
export const archivePath = `${blogPath}/archive`;

/** A post's date as the blog shows it, such as "October 13, 2024". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** A post's date as an HTML `datetime` value, such as `2024-10-13`. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
