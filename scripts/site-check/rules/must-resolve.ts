import type { MustResolveEntry } from "../must-resolve-list.ts";
import type { Rule, Severity } from "../site-check.ts";

export interface MustResolveOptions {
  /** How an entry the build does not serve is reported. */
  missing?: Severity;
}

/**
 * Every entry in the must-resolve list is served by the build as a page, a
 * file or a redirect page.
 */
export function mustResolve(
  entries: MustResolveEntry[],
  { missing = "warning" }: MustResolveOptions = {},
): Rule {
  return {
    name: "must-resolve",
    check(build) {
      return entries
        .filter((entry) => build.resolve(entry.path) === undefined)
        .map((entry) => ({
          rule: "must-resolve",
          severity: missing,
          message: `${entry.path} (${entry.section}) is not served by the build`,
        }));
    },
  };
}
