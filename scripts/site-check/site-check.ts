import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Severity = "error" | "warning";

/** One problem the site check found in a build. */
export interface Finding {
  /** The name of the rule that found it. */
  rule: string;
  severity: Severity;
  message: string;
}

/** A check over the build output. Rules see the build only as a host would. */
export interface Rule {
  name: string;
  check(build: Build): Finding[];
}

/**
 * The build output as GitHub Pages serves it. Paths are relative to the
 * build root, use `/` and keep their case.
 */
export interface Build {
  /** Every file in the build. */
  readonly files: ReadonlySet<string>;
  /**
   * The file GitHub Pages serves for a URL path, or `undefined` for a 404:
   * `/` and `/dir/` serve their `index.html`; `/page` serves the file
   * `page` or else `page.html`. Lookups are case-sensitive.
   */
  resolve(urlPath: string): string | undefined;
  /** The text of a file in the build. */
  read(file: string): string;
}

/** Runs every rule over the build in `buildDir` and returns their findings. */
export function checkSite(buildDir: string, rules: Rule[]): Finding[] {
  const build = loadBuild(buildDir);
  return rules.flatMap((rule) => rule.check(build));
}

function loadBuild(root: string): Build {
  const files = new Set(listFiles(root));
  return {
    files,
    resolve(urlPath) {
      const path = urlPath.replace(/^\//, "");
      if (path === "" || path.endsWith("/")) {
        const index = `${path}index.html`;
        return files.has(index) ? index : undefined;
      }
      if (files.has(path)) return path;
      const html = `${path}.html`;
      return files.has(html) ? html : undefined;
    },
    read(file) {
      return readFileSync(join(root, file), "utf8");
    },
  };
}

function listFiles(root: string): string[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      join(entry.parentPath, entry.name)
        .slice(root.length + 1)
        .split("\\")
        .join("/"),
    );
}
