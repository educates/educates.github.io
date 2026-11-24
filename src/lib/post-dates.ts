// The slug, date and draft flag of every post, read from the files under
// src/content/posts/ before the content layer has loaded them: the
// scheduled-posts integration needs them to set up the Markdown pipeline,
// and the daily deploy needs them without building the site.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseFrontmatter } from "astro/markdown";
import type { PostDating } from "./post-schedule.ts";

/** A post as its file names it, enough to tell whether a build publishes it. */
export interface PostFileDating extends PostDating {
  /** The post's `slug`, its id in the collection. */
  slug: string;
  /** The file, relative to the posts folder. */
  file: string;
}

/**
 * The posts in the folder `dir`, from the frontmatter of each `.md` and
 * `.mdx` file in it or below, parsed as the content layer parses it: the
 * `slug` is the entry's id, and `date` is coerced as the schema's
 * `z.coerce.date()` coerces it. A file without a `slug` or a valid `date`
 * is left out, for the schema to fail the build on.
 */
export async function postDatings(dir: string): Promise<PostFileDating[]> {
  const files = (await readdir(dir, { recursive: true }))
    .filter((file) => /\.mdx?$/.test(file))
    .sort();
  const posts: PostFileDating[] = [];
  for (const file of files) {
    const { frontmatter } = parseFrontmatter(
      await readFile(join(dir, file), "utf8"),
    );
    const date = new Date(frontmatter.date);
    if (!frontmatter.slug || Number.isNaN(date.getTime())) continue;
    posts.push({
      slug: String(frontmatter.slug),
      file,
      date,
      draft: frontmatter.draft === true,
    });
  }
  return posts;
}
