// "Used by": the companies whose logos the homepage shows. A company is
// listed only once it has acknowledged that it uses Educates and agreed to
// show its logo; until then it is not named anywhere on the site or in this
// repository. While the list is empty, the homepage leaves the section out.

import type { ImageMetadata } from "astro";

/** A company's logo, shown in the homepage's "Used by". */
export interface UsedByLogo {
  /** The company's name, which is also the logo's alternative text. */
  company: string;
  /** The logo, committed under src/assets/used-by/. */
  logo: ImageMetadata;
  /** When the company agreed to show its logo here. */
  acknowledged: Date;
}

/** Every acknowledged logo, imported from src/assets/used-by/. */
export const usedByLogos: readonly UsedByLogo[] = [];

/** What the homepage's "Used by" shows. */
export interface UsedBySection {
  logos: UsedByLogo[];
}

/**
 * The homepage's "Used by", or `undefined` while no company has
 * acknowledged its logo, which leaves the section out. Logos are listed by
 * company name, so their order ranks no company above another.
 */
export function usedBySection(
  logos: readonly UsedByLogo[] = usedByLogos,
): UsedBySection | undefined {
  if (logos.length === 0) return undefined;
  return {
    logos: [...logos].sort((a, b) =>
      a.company.localeCompare(b.company, "en", { sensitivity: "base" }),
    ),
  };
}
