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
