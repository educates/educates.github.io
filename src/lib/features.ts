// How the site arranges Features: the jobs they serve and the order it lists
// them in. These helpers take entries as plain data, so they work on the
// Feature collection and in tests alike.

/** The jobs a Feature serves, in the order the site lists them. */
export const jobIds = ["authoring", "delivering", "operating"] as const;

export type JobId = (typeof jobIds)[number];

/** A job Features serve, and who does it. */
export interface Job {
  id: JobId;
  /** The job's name, as section headings show it. */
  name: string;
  /** One line naming who does the job, which opens its section. */
  who: string;
}

/** The jobs, in the order the site lists them. */
export const jobs: readonly Job[] = [
  {
    id: "authoring",
    name: "Authoring",
    who: "For the workshop author, who writes the steps and builds the environment each Session starts from.",
  },
  {
    id: "delivering",
    name: "Delivering",
    who: "For Presenters and the people who run training portals, who put workshops in front of the people taking them.",
  },
  {
    id: "operating",
    name: "Operating",
    who: "For the platform team, who install Educates on their clusters and keep it running.",
  },
];

/** The fields of a Feature entry that these helpers read. */
export interface FeatureFields {
  job: JobId;
  sentence: string;
  flagship: boolean;
  order: number;
  educates4Only: boolean;
  educates4Sentence?: string | undefined;
  homepage?: number | undefined;
}

/** A Feature entry, such as one from the Feature collection. */
export interface FeatureEntry {
  data: FeatureFields;
}

/** A job with the Features that serve it. */
export interface JobFeatures<T extends FeatureEntry> {
  job: Job;
  features: T[];
}

/** Which Educates release the site describes. */
export interface Release {
  /** Whether Educates 4.0 is released; `site.educates4Released`. */
  educates4Released: boolean;
}

/**
 * The Features as the release the site describes has them. Until Educates
 * 4.0 is released, 4.0-only Features are left out and every Feature keeps
 * its `sentence`; once it is, a Feature with an `educates4Sentence`, which
 * names its 4.0-only parts, shows that instead.
 */
export function currentFeatures<T extends FeatureEntry>(
  entries: readonly T[],
  release: Release,
): T[] {
  if (!release.educates4Released) {
    return entries.filter((entry) => !entry.data.educates4Only);
  }
  return entries.map((entry) =>
    entry.data.educates4Sentence === undefined
      ? entry
      : {
          ...entry,
          data: { ...entry.data, sentence: entry.data.educates4Sentence },
        },
  );
}

/** Each job, in order, with the Features that serve it, lowest `order` first. */
export function featuresByJob<T extends FeatureEntry>(
  entries: readonly T[],
): JobFeatures<T>[] {
  return jobs.map((job) => ({
    job,
    features: entries
      .filter((entry) => entry.data.job === job.id)
      .sort((a, b) => a.data.order - b.data.order),
  }));
}

/**
 * Each job, in order, with the Features the homepage shows for it: those
 * with a `homepage` place, in that place.
 */
export function homepageFeaturesByJob<T extends FeatureEntry>(
  entries: readonly T[],
): JobFeatures<T>[] {
  return jobs.map((job) => ({
    job,
    features: entries
      .filter(
        (entry) =>
          entry.data.job === job.id && entry.data.homepage !== undefined,
      )
      .sort((a, b) => (a.data.homepage ?? 0) - (b.data.homepage ?? 0)),
  }));
}

/** The URL path of the Features overview. */
export const featuresPath = "/features";

/** The URL path of a flagship Feature's deep page. */
export function featurePath(slug: string): string {
  return `${featuresPath}/${slug}`;
}

/** A Feature entry with what a link to it needs. */
export interface FeatureLinkEntry {
  id: string;
  data: { name: string; flagship: boolean };
}

/**
 * Where a link to a Feature leads: a flagship's deep page, or any other
 * Feature's block on the overview.
 */
export function featureHref(entry: FeatureLinkEntry): string {
  return entry.data.flagship
    ? featurePath(entry.id)
    : `${featuresPath}#${entry.id}`;
}

/** A link to a Feature's page: its name and where it leads. */
export interface FeatureLink {
  name: string;
  href: string;
}

/**
 * Links to the Features named by `ids`, in that order, from `entries`, the
 * Features the site shows: a flagship's deep page, or any other Feature's
 * block on the overview. An id missing from `entries` fails the build;
 * `usedBy` names the page or file that named it, for the error message.
 */
export function featureLinks(
  ids: readonly string[],
  entries: readonly FeatureLinkEntry[],
  usedBy: string,
): FeatureLink[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  return ids.map((id) => {
    const entry = byId.get(id);
    if (!entry) {
      throw new Error(
        `${usedBy} names Feature "${id}", which the site does not show: it is missing from src/content/features/ or hidden until Educates 4.0 is released`,
      );
    }
    return { name: entry.data.name, href: featureHref(entry) };
  });
}

/** A Feature entry with what `deepPageShowing()` reads. */
export interface DeepPageEntry {
  id: string;
  data: {
    name: string;
    flagship: boolean;
    /** A flagship's deep page names the other Features it covers. */
    page?: { covers?: readonly string[] | undefined } | undefined;
  };
}

/** The deep page that shows a Feature: the flagship it belongs to, and its path. */
export interface DeepPage {
  id: string;
  name: string;
  href: string;
}

/**
 * The deep page that shows the Feature `id`, from `entries`, the Features
 * the site shows: a flagship's own deep page, or for another Feature, the
 * deep page of the flagship that covers it, such as the portal REST API on
 * the lookup service's page. A Feature no deep page covers has none.
 */
export function deepPageShowing(
  id: string,
  entries: readonly DeepPageEntry[],
): DeepPage | undefined {
  const flagships = entries.filter((entry) => entry.data.flagship);
  const page =
    flagships.find((entry) => entry.id === id) ??
    flagships.find((entry) => entry.data.page?.covers?.includes(id));
  return page
    ? { id: page.id, name: page.data.name, href: featurePath(page.id) }
    : undefined;
}
