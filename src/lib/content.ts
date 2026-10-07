import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import { site } from "../site.ts";
import { aboutSection } from "./about-section.ts";
import { entryFileUrl } from "./entry-files.ts";
import { currentFeatures, featureLinks } from "./features.ts";
import { guidePath } from "./guide-path.ts";
import { hubWorkshopLinks } from "./hub-workshops.ts";
import { youTubeVideoId } from "./outside-content.ts";
import { useCasesRelyingOn } from "./use-cases.ts";

export { featurePath } from "./features.ts";
export { useCasePath } from "./use-cases.ts";

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

/**
 * The use cases whose pages rely on the Feature `featureId`, naming it in
 * one of their capabilities, in their menu order.
 */
export async function useCasesUsing(featureId: string) {
  return useCasesRelyingOn(featureId, await useCases());
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

/**
 * The videos next to Feature entries, by their path from the project root,
 * with the URL each has in the build.
 */
const featureVideos = import.meta.glob<string>(
  "/src/content/features/**/*.{mp4,webm}",
  { query: "?url", import: "default", eager: true },
);

/**
 * A Feature loop's recording, for the VideoLoop component: its video's built
 * URL and its poster, or `undefined` until it is captured. `entryFilePath`
 * is the Feature entry's `filePath`; a video it names that is not there
 * fails the build.
 */
export function loopMedia(
  loop: { video?: string | undefined; poster?: ImageMetadata | undefined },
  entryFilePath: string,
) {
  if (loop.video === undefined || loop.poster === undefined) return undefined;
  return {
    src: entryFileUrl(loop.video, entryFilePath, featureVideos),
    poster: loop.poster,
  };
}

/**
 * The outside Content entry of the YouTube video `videoId`, which holds its
 * title, URL and poster. A video without one fails the build; `usedBy`
 * names who showed it.
 */
export async function youTubeVideo(videoId: string, usedBy: string) {
  const entry = (await getCollection("outsideContent")).find(
    (candidate) => youTubeVideoId(candidate.data.url) === videoId,
  );
  if (!entry) {
    throw new Error(
      `${usedBy}: YouTube video ${videoId} has no outside Content entry; add one under src/content/outside-content/`,
    );
  }
  return entry;
}
