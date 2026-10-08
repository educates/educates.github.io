import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { addPosters } from "../posters.ts";

/** A folder of outside Content entries: file name to YAML. */
function entries(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "posters-"));
  for (const [name, yaml] of Object.entries(files)) {
    writeFileSync(join(dir, name), yaml);
  }
  return dir;
}

/** An entry for a video on the project's own channel. */
function projectVideo(videoId: string): string {
  return [
    "title: A video",
    "kind: video",
    `url: https://www.youtube.com/watch?v=${videoId}`,
    "date: 2025-05-02",
    'channel: "@EducatesTrainingPlatform"',
    "description: One line.",
    'length: "10:45"',
    "",
  ].join("\n");
}

/** A JPEG of the given size in one colour. */
function jpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: "#2f6fde" },
  })
    .jpeg()
    .toBuffer();
}

/**
 * A 4:3 JPEG with the 16:9 picture between black bars, as YouTube serves
 * `sddefault` and `hqdefault`.
 */
async function letterboxed(width: number, height: number): Promise<Buffer> {
  const pictureHeight = (width * 9) / 16;
  const picture = await sharp({
    create: {
      width,
      height: pictureHeight,
      channels: 3,
      background: "#2f6fde",
    },
  })
    .png()
    .toBuffer();
  return sharp({
    create: { width, height, channels: 3, background: "#000000" },
  })
    .composite([{ input: picture, top: (height - pictureHeight) / 2, left: 0 }])
    .jpeg()
    .toBuffer();
}

/** The size of an image, and the colour of its top-left and bottom-left pixels. */
async function describeImage(file: string) {
  const { data, info } = await sharp(file)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixel = (offset: number) => (data[offset]! > 32 ? "blue" : "black");
  const lastRow = (info.height - 1) * info.width * info.channels;
  return {
    width: info.width,
    height: info.height,
    top: pixel(0 + 2),
    bottom: pixel(lastRow + 2),
  };
}

/**
 * YouTube's thumbnail host, i.ytimg.com, serving the given images by
 * `<video id>/<size>`; any other thumbnail is a 404. Records the URLs asked.
 */
function fakeYouTube(images: Record<string, Buffer>) {
  const requested: string[] = [];
  const fetch = async (input: string | URL | Request): Promise<Response> => {
    const url = String(input);
    requested.push(url);
    const match = url.match(
      /^https:\/\/i\.ytimg\.com\/vi\/([^/]+)\/(\w+)\.jpg$/,
    );
    const image = match && images[`${match[1]}/${match[2]}`];
    return image
      ? new Response(new Uint8Array(image), { status: 200 })
      : new Response("", { status: 404 });
  };
  return { fetch, requested };
}

describe("addPosters", () => {
  it("downloads maxresdefault beside a video from the project's channel and references it from the entry", async () => {
    const maxres = await jpeg(1280, 720);
    const dir = entries({ "install.yml": projectVideo("C6vCd6Nhf5M") });
    const youTube = fakeYouTube({ "C6vCd6Nhf5M/maxresdefault": maxres });

    await addPosters(dir, youTube.fetch);

    expect(readFileSync(join(dir, "install.jpg"))).toEqual(maxres);
    expect(parse(readFileSync(join(dir, "install.yml"), "utf8")).poster).toBe(
      "./install.jpg",
    );
  });

  it("falls back to sddefault without its black bars when maxresdefault is missing", async () => {
    const dir = entries({ "install.yml": projectVideo("C6vCd6Nhf5M") });
    const youTube = fakeYouTube({
      "C6vCd6Nhf5M/sddefault": await letterboxed(640, 480),
      "C6vCd6Nhf5M/hqdefault": await letterboxed(480, 360),
    });

    await addPosters(dir, youTube.fetch);

    expect(await describeImage(join(dir, "install.jpg"))).toEqual({
      width: 640,
      height: 360,
      top: "blue",
      bottom: "blue",
    });
  });

  it("falls back to hqdefault without its black bars when sddefault is missing too", async () => {
    const dir = entries({ "install.yml": projectVideo("C6vCd6Nhf5M") });
    const youTube = fakeYouTube({
      "C6vCd6Nhf5M/hqdefault": await letterboxed(480, 360),
    });

    await addPosters(dir, youTube.fetch);

    expect(await describeImage(join(dir, "install.jpg"))).toEqual({
      width: 480,
      height: 270,
      top: "blue",
      bottom: "blue",
    });
  });

  it("fails for a video YouTube has no thumbnail for, and leaves its entry as it was", async () => {
    const dir = entries({ "install.yml": projectVideo("C6vCd6Nhf5M") });

    await expect(addPosters(dir, fakeYouTube({}).fetch)).rejects.toThrow(
      "install.yml: YouTube has no thumbnail for video C6vCd6Nhf5M",
    );
    expect(existsSync(join(dir, "install.jpg"))).toBe(false);
    expect(readFileSync(join(dir, "install.yml"), "utf8")).toBe(
      projectVideo("C6vCd6Nhf5M"),
    );
  });

  it("fails rather than falling back to a smaller poster when YouTube answers with an error", async () => {
    const dir = entries({ "install.yml": projectVideo("C6vCd6Nhf5M") });
    const sddefault = await letterboxed(640, 480);
    const fetch = async (input: string | URL | Request) =>
      String(input).endsWith("/maxresdefault.jpg")
        ? new Response("", { status: 503 })
        : new Response(new Uint8Array(sddefault), { status: 200 });

    await expect(addPosters(dir, fetch)).rejects.toThrow(
      "install.yml: https://i.ytimg.com/vi/C6vCd6Nhf5M/maxresdefault.jpg answered 503",
    );
    expect(existsSync(join(dir, "install.jpg"))).toBe(false);
  });

  it("never asks YouTube for the thumbnail of a video from another channel", async () => {
    const otherChannel = projectVideo("jNQXAC9IVRw").replace(
      '"@EducatesTrainingPlatform"',
      '"@CNCF"',
    );
    const dir = entries({ "talk.yml": otherChannel });
    const youTube = fakeYouTube({
      "jNQXAC9IVRw/maxresdefault": await jpeg(1280, 720),
    });

    expect(await addPosters(dir, youTube.fetch)).toEqual([]);
    expect(youTube.requested).toEqual([]);
    expect(existsSync(join(dir, "talk.jpg"))).toBe(false);
    expect(readFileSync(join(dir, "talk.yml"), "utf8")).toBe(otherChannel);
  });

  it("leaves a video that has its poster alone", async () => {
    const withPoster = `${projectVideo("C6vCd6Nhf5M")}poster: ./install.jpg\n`;
    const dir = entries({ "install.yml": withPoster });
    writeFileSync(join(dir, "install.jpg"), await jpeg(1280, 720));
    const youTube = fakeYouTube({});

    expect(await addPosters(dir, youTube.fetch)).toEqual([]);
    expect(youTube.requested).toEqual([]);
  });

  it("downloads the poster again to the path its entry names when the file is gone", async () => {
    const maxres = await jpeg(1280, 720);
    const withPoster = `${projectVideo("C6vCd6Nhf5M")}poster: ./gcp-install.jpg\n`;
    const dir = entries({ "install.yml": withPoster });
    const youTube = fakeYouTube({ "C6vCd6Nhf5M/maxresdefault": maxres });

    expect(await addPosters(dir, youTube.fetch)).toEqual([
      { entry: "install.yml", poster: "gcp-install.jpg" },
    ]);
    expect(readFileSync(join(dir, "gcp-install.jpg"))).toEqual(maxres);
    expect(readFileSync(join(dir, "install.yml"), "utf8")).toBe(withPoster);
  });
});
