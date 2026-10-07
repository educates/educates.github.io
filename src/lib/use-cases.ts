// How the site shows and links use cases: a use case page's capabilities
// for the Educates release the site describes, and the use cases that rely
// on a Feature. These helpers take entries as plain data, so they work on
// the use case collection and in tests alike.
import type { Release } from "./features.ts";

/** The URL path of a use case's page. */
export function useCasePath(slug: string): string {
  return `/use-cases/${slug}`;
}

/** A capability on a use case page, as its entry writes it. */
export interface UseCaseCapability {
  title: string;
  text: string;
  /** The ids of the Features it rests on. */
  features: readonly string[];
  /**
   * The text to show instead once Educates 4.0 is released, for a
   * capability that 4.0 extends, such as self-hosting that can then be
   * air-gapped.
   */
  educates4Text?: string | undefined;
  /** The Features to link instead once Educates 4.0 is released. */
  educates4Features?: readonly string[] | undefined;
}

/** A capability as the page shows it. */
export interface CurrentCapability {
  title: string;
  text: string;
  features: readonly string[];
}

/**
 * The capabilities as the release the site describes has them. Until
 * Educates 4.0 is released every capability keeps its `text` and
 * `features`; once it is, a capability with `educates4Text` or
 * `educates4Features` shows those instead.
 */
export function currentCapabilities(
  capabilities: readonly UseCaseCapability[],
  release: Release,
): CurrentCapability[] {
  return capabilities.map((capability) => ({
    title: capability.title,
    text: release.educates4Released
      ? (capability.educates4Text ?? capability.text)
      : capability.text,
    features: release.educates4Released
      ? (capability.educates4Features ?? capability.features)
      : capability.features,
  }));
}

/** A use case entry with what `useCasesRelyingOn()` reads. */
export interface UseCaseEntry {
  id: string;
  data: {
    name: string;
    promise: string;
    /** A use case with a page names the Features each capability rests on. */
    page?: { capabilities: readonly UseCaseCapability[] } | undefined;
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
