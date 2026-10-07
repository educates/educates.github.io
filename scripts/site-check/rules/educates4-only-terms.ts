import type { Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface Educates4OnlyTermsOptions {
  /** Whether Educates 4.0 is released; `site.educates4Released`. */
  educates4Released: boolean;
  /**
   * Sections checked whole, by URL path: the page at the path and every
   * page under it. `/features` checks `/features` and
   * `/features/examiner-checks`, never `/features-archive`.
   */
  sections: string[];
  /** Single pages checked, by URL path, such as `/`; pages under them are not. */
  pages: string[];
  /** Terms only Educates 4.0 brings, such as `/air[\s-]?gapped/i`. */
  terms: RegExp[];
}

/**
 * Until Educates 4.0 is released, no page in `sections` or `pages` names a
 * term that only 4.0 brings, anywhere in its HTML: the copy, a link or an
 * attribute. The site describes the release current at launch, so such a
 * term belongs in a 4.0-only field, such as a use case capability's
 * `educates4Text`. Once 4.0 is released, the rule passes every page.
 */
export function educates4OnlyTerms({
  educates4Released,
  sections,
  pages,
  terms,
}: Educates4OnlyTermsOptions): Rule {
  const checked = (path: string) =>
    pages.includes(path) ||
    sections.some(
      (section) => path === section || path.startsWith(`${section}/`),
    );
  return {
    name: "educates4-only-terms",
    check(build) {
      if (educates4Released) return [];
      return build
        .pages()
        .filter((file) => checked(urlPathOf(file)))
        .flatMap((file) => {
          const html = build.read(file);
          return terms.flatMap((term) => {
            const found = html.match(term);
            return found
              ? [
                  {
                    rule: "educates4-only-terms",
                    severity: "error" as const,
                    message: `${urlPathOf(file)} (${file}) says "${found[0]}", which only Educates 4.0 brings: keep it in a 4.0-only field until site.educates4Released is on`,
                  },
                ]
              : [];
          });
        });
    },
  };
}
