import { describe, expect, it } from "vitest";
import { cliDownloads } from "../downloads.ts";

const latest =
  "https://github.com/educates/educates-training-platform/releases/latest/download";

describe("cliDownloads", () => {
  it("links each macOS and Linux build to its asset on the latest release", () => {
    expect(
      cliDownloads.map((platform) => ({
        os: platform.os,
        builds: platform.builds.map(({ label, href }) => ({ label, href })),
      })),
    ).toEqual([
      {
        os: "macOS",
        builds: [
          {
            label: "Apple silicon (arm64)",
            href: `${latest}/educates-darwin-arm64`,
          },
          { label: "Intel (amd64)", href: `${latest}/educates-darwin-amd64` },
        ],
      },
      {
        os: "Linux",
        builds: [
          { label: "amd64", href: `${latest}/educates-linux-amd64` },
          { label: "arm64", href: `${latest}/educates-linux-arm64` },
        ],
      },
    ]);
  });
});
