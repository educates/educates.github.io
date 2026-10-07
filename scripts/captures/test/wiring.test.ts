import { describe, expect, it } from "vitest";
import { captureFiles, wiringProblems } from "../slots.ts";

describe("captureFiles", () => {
  it("names a screenshot after its shot, next to the entry", () => {
    expect(
      captureFiles({
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual",
        kind: "screenshot",
      }),
    ).toEqual({ image: "./training-portal/catalog.webp" });
  });

  it("names a loop's video and poster after its shot", () => {
    expect(
      captureFiles({
        id: "clickable-actions/run",
        feature: "clickable-actions",
        slot: "loop",
        kind: "loop",
      }),
    ).toEqual({
      video: "./clickable-actions/run.mp4",
      poster: "./clickable-actions/run-poster.webp",
    });
  });
});

describe("wiringProblems", () => {
  const entries = [
    {
      id: "training-portal",
      data: {
        visual: { src: "./training-portal/catalog.webp", alt: "The catalog." },
      },
    },
    {
      id: "clickable-actions",
      data: {
        visual: { src: "./clickable-actions/overview.webp", alt: "Actions." },
        page: {
          loop: {
            alt: "A command runs.",
            video: "./clickable-actions/run.mp4",
            poster: "./clickable-actions/run-poster.webp",
          },
          things: [
            { title: "Run commands" },
            {
              title: "Edit files",
              visual: { src: "./clickable-actions/old.webp", alt: "Old." },
            },
          ],
        },
      },
    },
  ];

  it("finds nothing when every entry names its shots' files", () => {
    const shots = [
      {
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "clickable-actions/overview",
        feature: "clickable-actions",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "clickable-actions/run",
        feature: "clickable-actions",
        slot: "loop" as const,
        kind: "loop" as const,
      },
    ];

    expect(wiringProblems(shots, entries)).toEqual([]);
  });

  it("names a shot its entry does not show, or shows another file for", () => {
    const shots = [
      {
        id: "clickable-actions/terminals",
        feature: "clickable-actions",
        slot: 0,
        kind: "screenshot" as const,
      },
      {
        id: "clickable-actions/editor",
        feature: "clickable-actions",
        slot: 1,
        kind: "screenshot" as const,
      },
    ];

    expect(wiringProblems(shots, entries)).toEqual([
      "clickable-actions/terminals: clickable-actions does not show ./clickable-actions/terminals.webp as thing 1",
      "clickable-actions/editor: clickable-actions does not show ./clickable-actions/editor.webp as thing 2",
    ]);
  });
});
