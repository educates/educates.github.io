import type { Finding, Rule } from "../site-check.ts";

export interface OpenGraphImagesOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
}

/**
 * The site-wide social card, which stays in the build as the logo of the
 * structured data but is no page's Open Graph image.
 */
const SOCIAL_CARD = "/img/educates-social-card.png";

/**
 * Every page shares its own image: an `og:image` that is an absolute URL on
 * the site, names a file in the build, and comes with `og:image:width` and
 * `og:image:height`. Redirect pages are skipped.
 */
export function openGraphImages({ origin }: OpenGraphImagesOptions): Rule {
  return {
    name: "open-graph-images",
    check(build) {
      const findings: Finding[] = [];
      const fail = (file: string, message: string) =>
        findings.push({
          rule: "open-graph-images",
          severity: "error",
          message: `${file}: ${message}`,
        });

      for (const file of build.pages()) {
        const document = build.html(file);
        const content = (property: string) =>
          document
            .querySelector(`meta[property="${property}"]`)
            ?.getAttribute("content");

        const image = content("og:image");
        if (image === undefined) {
          fail(file, "no og:image");
          continue;
        }
        for (const property of ["og:image:width", "og:image:height"]) {
          if (!content(property)) fail(file, `og:image has no ${property}`);
        }
        if (!image.startsWith(`${origin}/`)) {
          fail(file, `og:image ${image} is not an absolute URL on ${origin}`);
          continue;
        }
        const path = new URL(image).pathname;
        if (path === SOCIAL_CARD) {
          fail(
            file,
            `og:image is the site-wide ${SOCIAL_CARD}; every page shares its own image`,
          );
        } else if (!build.files.has(path.slice(1))) {
          fail(file, `og:image ${image} is missing from the build`);
        }
      }
      return findings;
    },
  };
}
