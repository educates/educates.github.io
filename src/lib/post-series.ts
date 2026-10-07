// A blog post series: posts that share a `series` name in their front
// matter, each with its `part` number. A post's page shows a series box
// listing the parts.

/** A published post, as a series needs it. */
export interface SeriesPost {
  /** The post's slug. */
  id: string;
  title: string;
  /** The URL path of the post's page. */
  href: string;
  /** The name of the series the post belongs to. */
  series?: string | undefined;
  /** Its place in the series, from 1. */
  part?: number | undefined;
}

/** One part of a series, as its box lists it. */
export interface SeriesPart {
  title: string;
  href: string;
  part: number;
  /** Whether it is the post the box is shown on. */
  current: boolean;
}

/** A series, as the box on one of its posts lists it. */
export interface PostSeries {
  name: string;
  /** The part the box is shown on. */
  part: number;
  /** Every published part, in order. */
  parts: SeriesPart[];
}

/**
 * The series the post `id` belongs to, with its published parts in order,
 * or `undefined` when the post is in no series or is the only part
 * published.
 */
export function seriesOf(
  id: string,
  posts: readonly SeriesPost[],
): PostSeries | undefined {
  const post = posts.find((candidate) => candidate.id === id);
  if (post?.series === undefined || post.part === undefined) return undefined;
  const members = posts.filter((candidate) => candidate.series === post.series);
  const parts = members
    .map((candidate) => ({
      title: candidate.title,
      href: candidate.href,
      part: candidate.part!,
      current: candidate.id === id,
    }))
    .sort((a, b) => a.part - b.part);
  for (const [index, { part }] of parts.entries()) {
    if (parts[index + 1]?.part !== part) continue;
    const ids = members
      .filter((member) => member.part === part)
      .map((member) => member.id);
    throw new Error(
      `Posts ${ids.join(", ")} all claim part ${part} of the series "${post.series}"; give each its own part`,
    );
  }
  // A series of one part has nothing to list, until its next part is out.
  if (parts.length < 2) return undefined;
  return { name: post.series, part: post.part, parts };
}
