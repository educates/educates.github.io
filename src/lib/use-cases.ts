// How a use case page shows its capabilities for the Educates release the
// site describes. These helpers take entries as plain data, so they work on
// the use case collection and in tests alike.
import type { Release } from "./features.ts";

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
