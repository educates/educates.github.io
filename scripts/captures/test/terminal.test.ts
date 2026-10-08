import { describe, expect, it } from "vitest";
import { screenRows, terminalFontSize } from "../terminal.ts";

describe("screenRows", () => {
  it("counts the lines a cast's output fills, wrapping long ones at the terminal's width", () => {
    const events: [number, "o", string][] = [
      [0.1, "o", "\u001b[1;36m~\u001b[0m $ "],
      [0.2, "o", "echo hello\r\n"],
      [0.3, "o", "hello\r\n"],
      [0.4, "o", `${"x".repeat(25)}\r\n`],
      [0.5, "o", "\u001b[1;36m~\u001b[0m $ "],
    ];

    // "~ $ echo hello" wraps to 2 rows, "hello" takes 1, 25 x to 3, the prompt 1.
    expect(screenRows(events, 10)).toBe(7);
  });
});

describe("terminalFontSize", () => {
  it("keeps the usual size up to the default width", () => {
    expect(terminalFontSize(100)).toBe(15);
    expect(terminalFontSize(80)).toBe(15);
  });

  it("shrinks a wider terminal's font in proportion, so its window still fits", () => {
    expect(terminalFontSize(132)).toBe(11);
  });
});
