import { describe, expect, it } from "vitest";
import { entryFileUrl } from "../entry-files.ts";

const files = {
  "/src/content/features/clickable-actions/terminal.mp4":
    "/_astro/terminal.Bx31.mp4",
  "/src/content/features/isolated-sessions.mp4":
    "/_astro/isolated-sessions.C9a0.mp4",
};

describe("entryFileUrl", () => {
  it("gives the built URL of a file named relative to the entry that names it", () => {
    expect(
      entryFileUrl(
        "./clickable-actions/terminal.mp4",
        "src/content/features/clickable-actions.md",
        files,
      ),
    ).toBe("/_astro/terminal.Bx31.mp4");
    expect(
      entryFileUrl(
        "isolated-sessions.mp4",
        "src/content/features/isolated-sessions.md",
        files,
      ),
    ).toBe("/_astro/isolated-sessions.C9a0.mp4");
  });

  it("fails on a file that is not there, naming the file and the entry", () => {
    expect(() =>
      entryFileUrl(
        "./clickable-actions/editor.mp4",
        "src/content/features/clickable-actions.md",
        files,
      ),
    ).toThrow(
      'src/content/features/clickable-actions.md names "./clickable-actions/editor.mp4", which is not a file next to it',
    );
  });
});
