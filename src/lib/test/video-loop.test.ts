import { describe, expect, it } from "vitest";
import { loopShouldPlay } from "../video-loop.ts";

describe("loopShouldPlay", () => {
  it("plays a loop on screen, and pauses it off screen", () => {
    expect(loopShouldPlay({ onScreen: true, reducedMotion: false })).toBe(true);
    expect(loopShouldPlay({ onScreen: false, reducedMotion: false })).toBe(
      false,
    );
  });

  it("keeps a loop paused for a visitor who prefers reduced motion", () => {
    expect(loopShouldPlay({ onScreen: true, reducedMotion: true })).toBe(false);
  });

  it("follows the visitor's play or pause over everything but being off screen", () => {
    expect(
      loopShouldPlay({ onScreen: true, reducedMotion: true, choice: "play" }),
    ).toBe(true);
    expect(
      loopShouldPlay({ onScreen: true, reducedMotion: false, choice: "pause" }),
    ).toBe(false);
    expect(
      loopShouldPlay({ onScreen: false, reducedMotion: true, choice: "play" }),
    ).toBe(false);
  });
});
