// Wires a capture into its Feature entry: writes the screenshot or the
// loop's files, and its alt text, into the entry's frontmatter, leaving the
// rest of the entry as it was.

import { isMap, isSeq, parseDocument, type Document, type YAMLMap } from "yaml";
import { captureFiles, type ShotTarget } from "./slots.ts";

/** A shot with the alt text its capture gets on the page. */
export interface WiredShot extends ShotTarget {
  alt: string;
}

const frontmatterPattern = /^---\n([\s\S]*?)\n---\n/;

/** The keys a Feature's own `visual` goes before, in the schema's order. */
const afterVisual = ["flagship", "order", "homepage", "page"];

/**
 * The entry's Markdown with the shot's files wired into its slot: the
 * Feature's `visual`, its deep page's `loop`, or the `visual` of one of the
 * deep page's things.
 */
export function wireCapture(markdown: string, shot: WiredShot): string {
  const match = frontmatterPattern.exec(markdown);
  if (!match) throw new Error(`${shot.feature} has no frontmatter`);
  const document = parseDocument(match[1]!);
  const files = captureFiles(shot);

  if (shot.slot === "visual") {
    if (!("image" in files))
      throw new Error(`${shot.id}: a Feature's visual is a screenshot`);
    setBefore(
      document,
      document.contents as YAMLMap,
      "visual",
      { src: files.image, alt: shot.alt },
      afterVisual,
    );
  } else if (shot.slot === "loop") {
    if (!("video" in files))
      throw new Error(`${shot.id}: a deep page's loop is a loop`);
    const loop = document.getIn(["page", "loop"]);
    if (!isMap(loop)) throw new Error(`${shot.feature} has no deep page loop`);
    loop.set("alt", shot.alt);
    loop.set("video", files.video);
    loop.set("poster", files.poster);
  } else {
    const things = document.getIn(["page", "things"]);
    const thing = isSeq(things) ? things.items[shot.slot] : undefined;
    if (!isMap(thing))
      throw new Error(`${shot.feature} has no thing ${shot.slot + 1}`);
    if ("image" in files) {
      thing.delete("loop");
      thing.set(
        "visual",
        document.createNode({ src: files.image, alt: shot.alt }),
      );
    } else {
      thing.delete("visual");
      thing.set(
        "loop",
        document.createNode({
          alt: shot.alt,
          video: files.video,
          poster: files.poster,
        }),
      );
    }
  }

  const frontmatter = document.toString({
    lineWidth: 0,
    flowCollectionPadding: false,
  });
  return markdown.replace(frontmatterPattern, () => `---\n${frontmatter}---\n`);
}

/**
 * Sets `key` in `map` to `value`, in place if it is there, or else before
 * the first of `before` the map holds.
 */
function setBefore(
  document: Document,
  map: YAMLMap,
  key: string,
  value: unknown,
  before: readonly string[],
) {
  if (map.has(key)) {
    map.set(key, document.createNode(value));
    return;
  }
  const index = map.items.findIndex((pair) =>
    before.includes(String(pair.key)),
  );
  const pair = document.createPair(key, value);
  if (index === -1) map.items.push(pair);
  else map.items.splice(index, 0, pair);
}
