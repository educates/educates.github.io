// Outside Content: videos, talks and articles published somewhere other
// than this site, one YAML file per entry under src/content/outside-content/.
// These rules hold for every entry; the collection's schema applies them,
// so an entry that breaks one fails the build.

/** The project's own YouTube channel, by its handle. */
export const projectYouTubeChannel = "@EducatesTrainingPlatform";

/**
 * The kinds of outside Content. The Learn page lists videos and talks
 * together, and articles apart.
 */
export const outsideContentKinds = ["video", "talk", "article"] as const;

export type OutsideContentKind = (typeof outsideContentKinds)[number];

/** The fields of an entry the rules read. */
export interface OutsideEntryFields {
  kind: OutsideContentKind;
  url: string;
  channel?: string | undefined;
  poster?: unknown;
  length?: string | undefined;
  author?: string | undefined;
}

/**
 * The id of the YouTube video a URL links to, from its `watch?v=` or
 * `youtu.be/` form, or undefined for any other URL.
 */
export function youTubeVideoId(url: string): string | undefined {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "youtube.com" && parsed.pathname === "/watch") {
    return parsed.searchParams.get("v") ?? undefined;
  }
  if (host === "youtu.be") return parsed.pathname.slice(1) || undefined;
  return undefined;
}

/**
 * Whether an entry is a video on the project's own YouTube channel: the only
 * videos whose YouTube poster the site downloads and shows.
 */
export function isProjectVideo(entry: OutsideEntryFields): boolean {
  return (
    entry.channel === projectYouTubeChannel &&
    youTubeVideoId(entry.url) !== undefined
  );
}

/** Whether `tag` is a well-formed BCP 47 language tag, such as `es` or `pt-BR`. */
export function isLanguageTag(tag: string): boolean {
  try {
    Intl.getCanonicalLocales(tag);
    return true;
  } catch {
    return false;
  }
}

/** Something wrong with an entry: the field at fault, and why. */
export interface OutsideEntryProblem {
  field: keyof OutsideEntryFields;
  message: string;
}

/** What is wrong with an entry, for the build's error. */
export function outsideEntryProblems(
  entry: OutsideEntryFields,
): OutsideEntryProblem[] {
  const problems: OutsideEntryProblem[] = [];
  if (entry.kind !== "article" && entry.length === undefined) {
    problems.push({
      field: "length",
      message: "a video or talk needs its `length`, such as `10:45`",
    });
  }
  if (entry.kind === "article" && entry.author === undefined) {
    problems.push({
      field: "author",
      message: "an article needs its `author`, whom its cover names",
    });
  }
  const projectVideo = isProjectVideo(entry);
  if (projectVideo && entry.poster === undefined) {
    problems.push({
      field: "poster",
      message:
        "a video from the project's YouTube channel needs its poster: run `npm run posters` and commit the poster with the entry",
    });
  }
  // YouTube's terms bar downloading other people's thumbnails.
  if (!projectVideo && entry.poster !== undefined) {
    problems.push({
      field: "poster",
      message:
        "only videos from the project's YouTube channel have a poster: use `cover` for an image the project has the right to use",
    });
  }
  return problems;
}
