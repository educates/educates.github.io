import { describe, expect, it } from "vitest";
import { isLanguageTag, outsideEntryProblems } from "../outside-content.ts";

/** A video on the project's own YouTube channel, as an entry gives it. */
const projectVideo = {
  kind: "video",
  url: "https://www.youtube.com/watch?v=C6vCd6Nhf5M",
  channel: "@EducatesTrainingPlatform",
  length: "10:45",
} as const;

/** A poster, as the schema's image() helper gives it. */
const poster = { src: "/poster.jpg", width: 1280, height: 720, format: "jpg" };

describe("outsideEntryProblems", () => {
  it("rejects a video from the project's channel without a poster", () => {
    expect(outsideEntryProblems(projectVideo)).toEqual([
      {
        field: "poster",
        message:
          "a video from the project's YouTube channel needs its poster: run `npm run posters` and commit the poster with the entry",
      },
    ]);
  });

  it("rejects a video from the project's channel linked as youtu.be without a poster", () => {
    expect(
      outsideEntryProblems({
        ...projectVideo,
        url: "https://youtu.be/C6vCd6Nhf5M",
      }),
    ).toHaveLength(1);
  });

  it("accepts a video from the project's channel with its poster", () => {
    expect(outsideEntryProblems({ ...projectVideo, poster })).toEqual([]);
  });

  it("accepts a video from another channel without a poster", () => {
    expect(
      outsideEntryProblems({
        ...projectVideo,
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        channel: "@CNCF",
      }),
    ).toEqual([]);
  });

  it("rejects a poster on a video from another channel", () => {
    expect(
      outsideEntryProblems({
        ...projectVideo,
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        channel: "@CNCF",
        poster,
      }),
    ).toEqual([
      {
        field: "poster",
        message:
          "only videos from the project's YouTube channel have a poster: use `cover` for an image the project has the right to use",
      },
    ]);
  });

  it("rejects a talk without its length", () => {
    expect(
      outsideEntryProblems({
        kind: "talk",
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        channel: "@CNCF",
      }),
    ).toEqual([
      {
        field: "length",
        message: "a video or talk needs its `length`, such as `10:45`",
      },
    ]);
  });

  it("accepts an article with its author and without a poster", () => {
    expect(
      outsideEntryProblems({
        kind: "article",
        url: "https://grahamdumpleton.me/posts/2026/02/developer-advocacy-in-2026/",
        author: "Graham Dumpleton",
      }),
    ).toEqual([]);
  });

  it("rejects an article without its author, whom its cover names", () => {
    expect(
      outsideEntryProblems({
        kind: "article",
        url: "https://grahamdumpleton.me/posts/2026/02/developer-advocacy-in-2026/",
      }),
    ).toEqual([
      {
        field: "author",
        message: "an article needs its `author`, whom its cover names",
      },
    ]);
  });
});

describe("isLanguageTag", () => {
  it("accepts a language, alone or with its region", () => {
    expect(isLanguageTag("es")).toBe(true);
    expect(isLanguageTag("pt-BR")).toBe(true);
  });

  it("rejects a language and region joined by an underscore", () => {
    expect(isLanguageTag("es_ES")).toBe(false);
  });
});
