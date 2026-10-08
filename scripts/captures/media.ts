// Turns raw captures into the files the site serves: WebP screenshots and
// posters kept small, and short muted H.264 loops recorded from DevTools
// screencast frames.

import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { frameList, type Frame } from "./frames.ts";

/** The largest a screenshot or poster should be, in bytes. */
export const imageBudget = 300_000;

/** The width the site's loops are encoded at, in pixels. */
export const loopWidth = 1280;

/**
 * Writes an image as WebP at `path`, at most `width` pixels wide, lowering
 * the quality until it fits the image budget. Returns its size in bytes.
 */
export async function writeWebp(
  image: Buffer,
  path: string,
  width = 1920,
): Promise<number> {
  mkdirSync(dirname(path), { recursive: true });
  for (const quality of [82, 76, 70, 64, 58, 52]) {
    const data = await sharp(image)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    if (data.length <= imageBudget || quality === 52) {
      writeFileSync(path, data);
      return data.length;
    }
  }
  throw new Error("unreachable");
}

/** Two screenshots of the same height, side by side, with a gap between them. */
export async function sideBySide(
  left: Buffer,
  right: Buffer,
  gap = 0,
): Promise<Buffer> {
  const [a, b] = await Promise.all([
    sharp(left).metadata(),
    sharp(right).metadata(),
  ]);
  const height = Math.max(a.height ?? 0, b.height ?? 0);
  return sharp({
    create: {
      width: (a.width ?? 0) + gap + (b.width ?? 0),
      height,
      channels: 3,
      background: "#d0d7de",
    },
  })
    .composite([
      { input: left, left: 0, top: 0 },
      { input: right, left: (a.width ?? 0) + gap, top: 0 },
    ])
    .png()
    .toBuffer();
}

/**
 * Lays `foreground`, such as a terminal window, over `background`, such as
 * a page in the browser, at its bottom right.
 */
export async function overlay(
  background: Buffer,
  foreground: Buffer,
  margin = 48,
): Promise<Buffer> {
  const [back, front] = await Promise.all([
    sharp(background).metadata(),
    sharp(foreground).metadata(),
  ]);
  return sharp(background)
    .composite([
      {
        input: foreground,
        left: Math.max(0, (back.width ?? 0) - (front.width ?? 0) - margin),
        top: Math.max(0, (back.height ?? 0) - (front.height ?? 0) - margin),
      },
    ])
    .png()
    .toBuffer();
}

/** One screencast: its frames and the window it covers. */
export interface Recording {
  dir: string;
  frames: Frame[];
  start: number;
  end: number;
}

/**
 * How a loop of more than one screencast is laid out: side by side in a
 * row, or the second, cropped to `crop`, over the first at its bottom right.
 */
export type LoopLayout =
  | { kind: "row" }
  | {
      kind: "overlay";
      crop: { x: number; y: number; width: number; height: number };
    };

/**
 * Encodes screencasts as a muted H.264 MP4 at `path`, `width` pixels wide,
 * and writes its first frame as a WebP poster at `posterPath`. Returns the
 * video's size in bytes.
 */
export async function writeLoop(
  recordings: readonly Recording[],
  path: string,
  posterPath: string,
  layout: LoopLayout = { kind: "row" },
  width = loopWidth,
): Promise<number> {
  mkdirSync(dirname(path), { recursive: true });
  const inputs = recordings.flatMap((recording, index) => {
    const list = join(recording.dir, `frames-${index}.txt`);
    writeFileSync(list, frameList(recording.frames, recording));
    return ["-f", "concat", "-safe", "0", "-i", list];
  });
  const fps = 30;
  const scaled = recordings.map(
    (_, index) => `[${index}:v]fps=${fps},setpts=PTS-STARTPTS[v${index}]`,
  );
  const finish = `scale='min(${width},iw)':-2:flags=lanczos,format=yuv420p[out]`;
  let joined: string;
  if (recordings.length === 1) {
    joined = `[v0]${finish}`;
  } else if (layout.kind === "overlay") {
    const { x, y, width: w, height: h } = layout.crop;
    joined = `[v1]crop=${w}:${h}:${x}:${y}[top];[v0][top]overlay=x=main_w-overlay_w-24:y=main_h-overlay_h-24:shortest=1,${finish}`;
  } else {
    const stacked = recordings.map((_, index) => `[v${index}]`).join("");
    joined = `${stacked}hstack=inputs=${recordings.length},${finish}`;
  }
  const encode = (crf: number) =>
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        ...inputs,
        "-filter_complex",
        [...scaled, joined].join(";"),
        "-map",
        "[out]",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        String(crf),
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        path,
      ],
      { stdio: ["ignore", "inherit", "inherit"] },
    );
  let size = 0;
  for (const crf of [24, 27, 30, 33]) {
    encode(crf);
    size = statSync(path).size;
    if (size <= 1_000_000) break;
  }
  const poster = execFileSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-i",
      path,
      "-frames:v",
      "1",
      "-f",
      "image2pipe",
      "-c:v",
      "png",
      "-",
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  await writeWebp(poster, posterPath, width);
  return size;
}
