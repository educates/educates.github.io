// Files a content entry names by a path relative to itself, the way
// `image()` resolves images, for files `image()` does not handle, such as
// the videos of a Feature's loops. The caller globs the files with
// `import.meta.glob("/src/content/...", { query: "?url" })`, which gives
// their built URLs keyed by their path from the project root.
import { posix } from "node:path";

/**
 * The built URL of the file `ref`, named by the entry at `entryFilePath`
 * (its path from the project root, such as
 * `src/content/features/clickable-actions.md`), relative to that entry.
 * `files` maps each available file's path from the project root, starting
 * with `/`, to its built URL. A file that is not there fails the build.
 */
export function entryFileUrl(
  ref: string,
  entryFilePath: string,
  files: Readonly<Record<string, string>>,
): string {
  const path = `/${posix.join(posix.dirname(entryFilePath), ref)}`;
  const url = files[path];
  if (url === undefined) {
    throw new Error(
      `${entryFilePath} names "${ref}", which is not a file next to it`,
    );
  }
  return url;
}
