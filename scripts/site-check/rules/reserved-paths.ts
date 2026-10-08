import type { Rule } from "../site-check.ts";

export interface ReservedPathsOptions {
  /** URL paths kept free for later sections, such as `/hub`. */
  paths: string[];
}

/**
 * Nothing is built at a reserved URL path or under it: no page, redirect
 * page or other file. `/hub` is kept free for the Educates Hub to move into
 * the site.
 */
export function reservedPaths({ paths }: ReservedPathsOptions): Rule {
  return {
    name: "reserved-paths",
    check(build) {
      return paths.flatMap((reserved) => {
        const base = reserved.replace(/^\//, "");
        return [...build.files]
          .filter(
            (file) =>
              file === base ||
              file === `${base}.html` ||
              file.startsWith(`${base}/`),
          )
          .sort()
          .map((file) => ({
            rule: "reserved-paths",
            severity: "error" as const,
            message: `${file} is built under ${reserved}, which is reserved and must stay empty`,
          }));
      });
    },
  };
}
