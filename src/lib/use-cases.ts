// How the site links use cases. These helpers take entries as plain data, so
// they work on the use case collection and in tests alike.

/** The URL path of a use case's page. */
export function useCasePath(slug: string): string {
  return `/use-cases/${slug}`;
}

/** A use case entry with what these helpers read. */
export interface UseCaseEntry {
  id: string;
  data: {
    name: string;
    promise: string;
    /** A use case with a page names the Features each capability rests on. */
    page?: { capabilities: readonly { features: readonly string[] }[] };
  };
}

/** A link to a use case's page, with its promise. */
export interface UseCaseLink {
  name: string;
  promise: string;
  href: string;
}

/**
 * The use cases that rely on the Feature `featureId`: those whose page names
 * it in one of its capabilities, once each, in the order of `entries`. A use
 * case without a page names no Features, so it is never listed.
 */
export function useCasesRelyingOn(
  featureId: string,
  entries: readonly UseCaseEntry[],
): UseCaseLink[] {
  return entries
    .filter((entry) =>
      entry.data.page?.capabilities.some((capability) =>
        capability.features.includes(featureId),
      ),
    )
    .map((entry) => ({
      name: entry.data.name,
      promise: entry.data.promise,
      href: useCasePath(entry.id),
    }));
}
