import type { MustResolveEntry } from "../must-resolve-list.ts";
import type { Rule } from "../site-check.ts";

/**
 * Every entry in the must-resolve list is served by the build as a page, a
 * file or a redirect page.
 */
export function mustResolve(entries: MustResolveEntry[]): Rule {
  return {
    name: "must-resolve",
    check(build) {
      return entries
        .filter((entry) => build.resolve(entry.path) === undefined)
        .map((entry) => ({
          rule: "must-resolve",
          severity: "error" as const,
          message: `${entry.path} (${entry.section}) is not served by the build`,
        }));
    },
  };
}
