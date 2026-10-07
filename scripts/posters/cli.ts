// Downloads the poster of every video from the project's YouTube channel
// that has none, next to its outside Content entry, ready to commit with
// it. Usage: npm run posters [-- <entries folder>]
// Exits 1 when a poster could not be downloaded.

import { relative, resolve } from "node:path";
import { addPosters } from "./posters.ts";

const dir = resolve(process.argv[2] ?? "src/content/outside-content");
const shown = relative(process.cwd(), dir) || ".";

try {
  const added = await addPosters(dir, fetch);
  if (added.length === 0) {
    console.log(
      `posters: every video from the project's channel in ${shown} has its poster`,
    );
  }
  for (const { entry, poster } of added) {
    console.log(`posters: added ${shown}/${poster} for ${entry}`);
  }
  if (added.length > 0) console.log("Commit each poster with its entry.");
} catch (error) {
  console.error(`posters: failed for\n${(error as Error).message}`);
  process.exitCode = 1;
}
