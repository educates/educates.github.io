// Video posters: the YouTube thumbnail of every video from the project's
// own channel, downloaded once and committed next to its outside Content
// entry, so builds never contact YouTube. Videos from other channels never
// get one: YouTube's terms bar downloading other people's thumbnails.

import {
  appendFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, normalize } from "node:path";
import sharp from "sharp";
import { parse } from "yaml";
import {
  isProjectVideo,
  youTubeVideoId,
  type OutsideEntryFields,
} from "../../src/lib/outside-content.ts";

/** The fetch the posters are downloaded with: the global one, or a stand-in in tests. */
export type Fetch = (input: string) => Promise<Response>;

/**
 * The thumbnail sizes tried, largest first. Only `maxresdefault` is 16:9
 * (1280 by 720); `sddefault` (640 by 480) and `hqdefault` (480 by 360) put
 * the 16:9 picture between black bars, which are cropped off.
 */
const sizes = [
  { name: "maxresdefault", letterboxed: false },
  { name: "sddefault", letterboxed: true },
  { name: "hqdefault", letterboxed: true },
] as const;

/** A poster `addPosters()` added: the entry's file name and the poster's. */
export interface AddedPoster {
  entry: string;
  poster: string;
}

/**
 * Adds a poster to every entry in `dir` for a video from the project's
 * channel that has none: the poster is `<entry>.jpg` next to the entry, and
 * the entry gains `poster: ./<entry>.jpg`. An entry whose `poster` names a
 * file that is gone gets it downloaded again, which is how a poster is
 * refreshed. Fails, after trying every entry, when any poster could not be
 * downloaded; that entry is left as it was.
 */
export async function addPosters(
  dir: string,
  fetch: Fetch,
): Promise<AddedPoster[]> {
  const added: AddedPoster[] = [];
  const failures: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (![".yml", ".yaml"].includes(extname(name))) continue;
    const file = join(dir, name);
    const source = readFileSync(file, "utf8");
    const entry = parse(source) as OutsideEntryFields;
    if (!isProjectVideo(entry)) continue;
    const named = typeof entry.poster === "string" ? entry.poster : undefined;
    if (named !== undefined && existsSync(join(dir, named))) continue;
    try {
      const image = await downloadPoster(youTubeVideoId(entry.url)!, fetch);
      const poster = named ?? `./${basename(name, extname(name))}.jpg`;
      writeFileSync(join(dir, poster), image);
      if (named === undefined) {
        appendFileSync(
          file,
          `${source.endsWith("\n") ? "" : "\n"}poster: ${poster}\n`,
        );
      }
      added.push({ entry: name, poster: normalize(poster) });
    } catch (error) {
      failures.push(`${name}: ${(error as Error).message}`);
    }
  }
  if (failures.length > 0) throw new Error(failures.join("\n"));
  return added;
}

/** The largest 16:9 thumbnail YouTube has for a video, as a JPEG. */
async function downloadPoster(videoId: string, fetch: Fetch) {
  for (const size of sizes) {
    const url = `https://i.ytimg.com/vi/${videoId}/${size.name}.jpg`;
    const response = await fetch(url);
    // A missing size is a 404 with a 120 by 90 placeholder body.
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    const image = new Uint8Array(await response.arrayBuffer());
    return size.letterboxed ? cropTo16By9(image) : image;
  }
  throw new Error(`YouTube has no thumbnail for video ${videoId}`);
}

/** The middle 16:9 band of a 4:3 thumbnail, without its black bars. */
async function cropTo16By9(image: Uint8Array): Promise<Uint8Array> {
  const { width, height } = await sharp(image).metadata();
  const bandHeight = Math.round((width * 9) / 16);
  return sharp(image)
    .extract({
      left: 0,
      top: Math.round((height - bandHeight) / 2),
      width,
      height: bandHeight,
    })
    .jpeg()
    .toBuffer();
}
