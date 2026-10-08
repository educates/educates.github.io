import { describe, expect, it } from "vitest";
import { frameList } from "../frames.ts";

describe("frameList", () => {
  it("shows each frame until the next one arrives, and the last one until the recording ends", () => {
    const list = frameList(
      [
        { file: "frame-0.png", timestamp: 100.0 },
        { file: "frame-1.png", timestamp: 100.5 },
        { file: "frame-2.png", timestamp: 102.0 },
      ],
      { start: 100.0, end: 103.0 },
    );

    expect(list).toBe(
      [
        "ffconcat version 1.0",
        "file 'frame-0.png'",
        "duration 0.500",
        "file 'frame-1.png'",
        "duration 1.500",
        "file 'frame-2.png'",
        "duration 1.000",
        "file 'frame-2.png'",
        "",
      ].join("\n"),
    );
  });

  it("starts from the last frame before the start, which is what the screen showed then", () => {
    const list = frameList(
      [
        { file: "frame-0.png", timestamp: 99.0 },
        { file: "frame-1.png", timestamp: 99.5 },
        { file: "frame-2.png", timestamp: 101.0 },
      ],
      { start: 100.0, end: 102.0 },
    );

    expect(list).toBe(
      [
        "ffconcat version 1.0",
        "file 'frame-1.png'",
        "duration 1.000",
        "file 'frame-2.png'",
        "duration 1.000",
        "file 'frame-2.png'",
        "",
      ].join("\n"),
    );
  });

  it("leaves out frames after the end", () => {
    const list = frameList(
      [
        { file: "frame-0.png", timestamp: 100.0 },
        { file: "frame-1.png", timestamp: 105.0 },
      ],
      { start: 100.0, end: 102.0 },
    );

    expect(list).toBe(
      [
        "ffconcat version 1.0",
        "file 'frame-0.png'",
        "duration 2.000",
        "file 'frame-0.png'",
        "",
      ].join("\n"),
    );
  });
});
