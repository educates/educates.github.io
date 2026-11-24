import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { postDatings } from "../post-dates.ts";

/** A posts folder holding `files`, by path. */
function postsFolder(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "post-dates-"));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  }
  return dir;
}

describe("postDatings", () => {
  it("reads each post's slug, date and draft flag, folders and MDX too", async () => {
    const dir = postsFolder({
      "2026-11-23-one.md": "---\nslug: one\ndate: 2026-11-23\n---\nBody\n",
      "2026-11-24-two/index.md":
        "---\ntitle: Two\nslug: two\ndate: '2026-11-24'\ndraft: true\n---\n",
      "2026-11-25-three.mdx":
        '---\nslug: three\ndate: "2026-11-25T10:00:00Z"\n---\n',
      "2026-11-25-three/diagram.png": "not a post",
    });
    expect(await postDatings(dir)).toEqual([
      {
        slug: "one",
        file: "2026-11-23-one.md",
        date: new Date("2026-11-23T00:00:00Z"),
        draft: false,
      },
      {
        slug: "two",
        file: join("2026-11-24-two", "index.md"),
        date: new Date("2026-11-24T00:00:00Z"),
        draft: true,
      },
      {
        slug: "three",
        file: "2026-11-25-three.mdx",
        date: new Date("2026-11-25T10:00:00Z"),
        draft: false,
      },
    ]);
  });

  it("leaves out a file without a slug or a valid date", async () => {
    const dir = postsFolder({
      "no-slug.md": "---\ndate: 2026-11-23\n---\n",
      "no-date.md": "---\nslug: no-date\n---\n",
      "bad-date.md": "---\nslug: bad-date\ndate: someday\n---\n",
    });
    expect(await postDatings(dir)).toEqual([]);
  });
});
