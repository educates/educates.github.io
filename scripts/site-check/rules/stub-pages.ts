import type { Rule, Severity } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface StubPagesOptions {
  /** How a stub page in the build is reported. */
  severity?: Severity;
}

/**
 * No page is a stub: a placeholder the base layout marks with `data-stub`
 * on `<body>`, standing in for a page still to be written.
 */
export function stubPages({ severity = "error" }: StubPagesOptions = {}): Rule {
  return {
    name: "stub-pages",
    check(build) {
      return build
        .pages()
        .filter((file) => build.html(file).querySelector("body[data-stub]"))
        .map((file) => ({
          rule: "stub-pages",
          severity,
          message: `${urlPathOf(file)} (${file}) is a stub page`,
        }));
    },
  };
}
