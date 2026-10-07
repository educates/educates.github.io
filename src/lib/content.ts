import { getCollection } from "astro:content";
import { site } from "../site.ts";
import { aboutSection } from "./about-section.ts";
import { currentFeatures, featureLinks } from "./features.ts";
import { guidePath } from "./guide-path.ts";
import { hubWorkshopLinks } from "./hub-workshops.ts";

export { featurePath } from "./features.ts";

/** The Getting Started Guides' pages, and the path they make. */
export async function guides() {
  const entries = await getCollection("guides");
  const path = guidePath(
    entries.map((entry) => ({
      id: entry.id,
      title: entry.data.title,
      order: entry.data.order,
    })),
  );
  return { entries, path };
}

/** The About Educates pages, and the section they make. */
export async function aboutPages() {
  const entries = await getCollection("about");
  const section = aboutSection(
    entries.map((entry) => ({
      id: entry.id,
      title: entry.data.title,
      order: entry.data.order,
    })),
  );
  return { entries, section };
}

/** The use cases, in their menu order. */
export async function useCases() {
  return (await getCollection("useCases")).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/**
 * The Features of the release the site describes (see `currentFeatures()`
 * and `site.educates4Released`), in their menu order. Group them with
 * `featuresByJob()` or `homepageFeaturesByJob()` from `./features.ts`.
 */
export async function features() {
  return currentFeatures(await getCollection("features"), site).sort(
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

/**
 * Links to the Features named by `ids`, in that order: a flagship's deep
 * page, or any other Feature's block on the overview. A Feature the site
 * does not show fails the build; `usedBy` names who named it.
 */
export async function featureLinksFor(ids: readonly string[], usedBy: string) {
  return featureLinks(ids, await features(), usedBy);
}

/**
 * The Hub workshops named by `ids`, in that order, with their titles and
 * hub.educates.dev URLs from src/content/hub-workshops.yml. An id the file
 * does not define fails the build; `usedBy` names who named it.
 */
export async function hubWorkshops(ids: readonly string[], usedBy: string) {
  const links = (await getCollection("hubWorkshops")).map((entry) => ({
    id: entry.id,
    ...entry.data,
  }));
  return hubWorkshopLinks(ids, links, usedBy);
}
