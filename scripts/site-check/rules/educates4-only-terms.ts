import type { Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface Educates4OnlyTermsOptions {
  /** Whether Educates 4.0 is released; `site.educates4Released`. */
  educates4Released: boolean;
  /** URL paths whose pages, and the pages under them, are checked. */
  paths: string[];
  /** Terms only Educates 4.0 brings, such as `/air[\s-]?gapped/i`. */
  terms: RegExp[];
}

/**
 * Until Educates 4.0 is released, no page at or under `paths` names a term
 * that only 4.0 brings, anywhere in its HTML: the copy, a link or an
 * attribute. The site describes the release current at launch, so such a
 * term belongs in a 4.0-only field, such as a use case capability's
 * `educates4Text`. Once 4.0 is released, the rule passes every page.
 */
export function educates4OnlyTerms({
  educates4Released,
  paths,
  terms,
}: Educates4OnlyTermsOptions): Rule {
  return {
    name: "educates4-only-terms",
    check(build) {
      if (educates4Released) return [];
      return build
        .pages()
        .filter((file) => {
          const path = urlPathOf(file);
          return paths.some(
            (checked) => path === checked || path.startsWith(`${checked}/`),
          );
        })
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
