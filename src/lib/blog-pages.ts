// The paginated lists of the blog: every post, a tag's posts and an
// author's posts, with the titles and descriptions of their pages.

import { paginate, type Page } from "./pagination.ts";
import {
  authorPath,
  authorsByKey,
  blogPath,
  posts,
  tagPath,
  tagsByKey,
  type Author,
  type Post,
  type Tag,
} from "./posts.ts";

/** A page of a list of posts, with what its head and heading say. */
export interface PostListPage {
  page: Page<Post>;
  title: string;
  heading: string;
  description: string;
  lede?: string;
}

/** ", page N" for pages after the first, so each page's title differs. */
function pageSuffix(page: Page<Post>): string {
  return page.number === 1 ? "" : `, page ${page.number}`;
}

/** What the blog is, for its list pages and its feeds. */
export const blogDescription =
  "Posts from the Educates team on writing workshops, running Educates and what is new in the project.";

/** The pages of the list of every post: `/blog`, then `/blog/page/N`. */
export async function blogPages(): Promise<PostListPage[]> {
  return paginate(await posts(), blogPath).map((page) => ({
    page,
    title: `Blog${pageSuffix(page)}`,
    heading: "Blog",
    description: blogDescription,
    lede: blogDescription,
  }));
}

/**
 * The tags that have posts, each with its posts, in the order of
 * `src/content/tags.yml`. Tags without posts have no page.
 */
export async function tagsWithPosts(): Promise<{ tag: Tag; posts: Post[] }[]> {
  const all = await posts();
  return [...(await tagsByKey()).values()]
    .map((tag) => ({
      tag,
      posts: all.filter((post) => post.data.tags.includes(tag.id)),
    }))
    .filter(({ posts }) => posts.length > 0);
}

/** The pages of every tag's list of posts. */
export async function tagPages(): Promise<PostListPage[]> {
  return (await tagsWithPosts()).flatMap(({ tag, posts }) =>
    paginate(posts, tagPath(tag)).map((page) => ({
      page,
      title: `Posts tagged "${tag.data.label}"${pageSuffix(page)}`,
      heading: `Posts tagged "${tag.data.label}"`,
      description: `Educates blog posts tagged "${tag.data.label}": ${tag.data.description}.`,
    })),
  );
}

/**
 * The authors who have a page, each with their posts, in the order of
 * `src/content/authors.yml`.
 */
export async function authorsWithPosts(): Promise<
  { author: Author; posts: Post[] }[]
> {
  const all = await posts();
  return [...(await authorsByKey()).values()]
    .filter((author) => author.data.page)
    .map((author) => ({
      author,
      posts: all.filter((post) => post.data.authors.includes(author.id)),
    }));
}

/** The pages of every author's list of posts, each with its author. */
export async function authorPages(): Promise<
  (PostListPage & { author: Author })[]
> {
  return (await authorsWithPosts()).flatMap(({ author, posts }) =>
    paginate(posts, authorPath(author)).map((page) => ({
      page,
      author,
      title: `${author.data.name}${pageSuffix(page)}`,
      heading: author.data.name,
      description: `Educates blog posts by ${author.data.name}, ${author.data.title}.`,
    })),
  );
}
