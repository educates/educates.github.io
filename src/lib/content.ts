import { getCollection } from "astro:content";

/** The use cases, in their menu order. */
export async function useCases() {
  return (await getCollection("useCases")).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/** The Features, in their menu order. */
export async function features() {
  return (await getCollection("features")).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/** The flagship Features, the ones with a deep page, in their menu order. */
export async function flagshipFeatures() {
  return (await features()).filter((feature) => feature.data.flagship);
}

/** The URL path of a use case's page. */
export function useCasePath(slug: string): string {
  return `/use-cases/${slug}`;
}

/** The URL path of a flagship Feature's deep page. */
export function featurePath(slug: string): string {
  return `/features/${slug}`;
}
