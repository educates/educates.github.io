// Which posts a build publishes. A post's `date` is the day it goes out: a
// build leaves out the posts dated after its publish day, the UTC day the
// build starts on, and drafts. `posts()` in src/lib/posts.ts applies this to
// the pages and feeds; the scheduled-posts integration applies it to the
// links between posts; and the daily deploy asks `goesOutOn()` whether a
// post goes out today. The dev server shows every post.

/**
 * The environment variable that, set to `true`, makes a build publish the
 * posts dated after its publish day too, as the pull request checks do, so
 * that a post is checked before it goes out. Drafts stay out.
 */
export const includeFuturePostsVariable = "INCLUDE_FUTURE_POSTS";

/**
 * The environment variable that holds a build's publish day, `YYYY-MM-DD`.
 * The build sets it to the UTC day it starts on unless it is set, so every
 * page of one build agrees on the day, even across midnight. Set it to
 * build the site as it is on another day.
 */
export const publishDayVariable = "PUBLISH_DAY";

/** The environment a build reads its publish day from. */
export type ScheduleEnvironment = Readonly<Record<string, string | undefined>>;

/** What decides whether a build publishes a post. */
export interface PostDating {
  /** The post's `date`, its publish day at midnight UTC. */
  date: Date;
  draft: boolean;
}

/** The UTC day of `date`, as `YYYY-MM-DD`. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The last day whose posts a build publishes, from `env`: its publish day,
 * or the UTC day of `now` when none is set. `undefined` when the build
 * publishes the posts of every day. Throws on a value it cannot read.
 */
export function publishDay(
  env: ScheduleEnvironment,
  now = new Date(),
): string | undefined {
  const include = env[includeFuturePostsVariable] ?? "";
  if (include === "true") return undefined;
  if (include !== "" && include !== "false") {
    throw new Error(
      `${includeFuturePostsVariable} must be "true" or "false", not "${include}"`,
    );
  }
  const day = env[publishDayVariable] ?? "";
  if (day === "") return utcDay(now);
  if (!isDay(day)) {
    throw new Error(
      `${publishDayVariable} must be a day as YYYY-MM-DD, not "${day}"`,
    );
  }
  return day;
}

/** Whether `value` is a calendar day written as `YYYY-MM-DD`. */
export function isDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && utcDay(date) === value;
}

/**
 * Whether a build that publishes the posts up to `day` publishes `post`: a
 * post dated `day` or before, never a draft. With no `day`, every post but
 * the drafts.
 */
export function isPublished(
  post: PostDating,
  day: string | undefined,
): boolean {
  if (post.draft) return false;
  return day === undefined || utcDay(post.date) <= day;
}

/**
 * Whether `post` goes out on `day`: a build on that day publishes it, and
 * a build the day before left it out.
 */
export function goesOutOn(post: PostDating, day: string): boolean {
  return !post.draft && utcDay(post.date) === day;
}
