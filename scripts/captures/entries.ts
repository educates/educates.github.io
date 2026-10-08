// Reads the Feature entries the way the capture tool needs them: their ids
// and the frontmatter that holds their visuals, without Astro's content
// layer.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { FeatureEntry } from "./slots.ts";

/** The folder of the Feature entries, from the repository root. */
export const featuresDir = "src/content/features";

/** The path of a Feature entry's Markdown file. */
export function entryFile(id: string, dir = featuresDir): string {
  return join(dir, `${id}.md`);
}

/** Every Feature entry in `dir`, in file name order. */
export function readFeatureEntries(dir = featuresDir): FeatureEntry[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const markdown = readFileSync(join(dir, name), "utf8");
      const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(markdown)?.[1] ?? "";
      return { id: name.replace(/\.md$/, ""), data: parse(frontmatter) ?? {} };
    });
}
