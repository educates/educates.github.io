import { describe, expect, it } from "vitest";
import { readingMinutes } from "../reading-time.ts";

const words = (count: number) => Array(count).fill("word").join(" ");

describe("readingMinutes", () => {
  it("reads 200 words a minute, rounding up to whole minutes", () => {
    expect(readingMinutes(words(200))).toBe(1);
    expect(readingMinutes(words(201))).toBe(2);
    expect(readingMinutes(words(2000))).toBe(10);
  });

  it("counts the words of the Markdown source, code included, but not its punctuation", () => {
    const source = [
      "## Install it",
      "",
      "Run `educates create-cluster`, then:",
      "",
      "```",
      "kubectl get pods -n educates",
      "```",
    ].join("\n");
    // Install it Run educates create cluster then kubectl get pods n educates
    expect(readingMinutes(source + "\n" + words(200 - 12))).toBe(1);
    expect(readingMinutes(source + "\n" + words(200 - 11))).toBe(2);
  });

  it("gives a post too short to count one minute", () => {
    expect(readingMinutes("")).toBe(1);
  });
});
