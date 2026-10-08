import { describe, expect, it } from "vitest";
import { visualPlaceholders } from "../rules/visual-placeholders.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page } from "./fixture-build.ts";

const origin = "https://educates.dev";

/** A page at `url` with `count` visual placeholders in its body. */
function withPlaceholders(url: string, count: number): string {
  const placeholders =
    '<div data-visual-placeholder aria-hidden="true"></div>'.repeat(count);
  return page(url).replace("<h1>Page</h1>", `<h1>Page</h1>${placeholders}`);
}

describe("visual-placeholders rule", () => {
  it("passes pages whose visuals are all real", () => {
    const findings = checkSite(
      fixtureBuild({
        "features.html": page(`${origin}/features`),
        "features/examiner-checks.html": withPlaceholders(
          `${origin}/features/examiner-checks`,
          0,
        ),
      }),
      [visualPlaceholders()],
    );
    expect(findings).toEqual([]);
  });

  it("warns about each page that still shows a visual placeholder, with how many", () => {
    const findings = checkSite(
      fixtureBuild({
        "features.html": withPlaceholders(`${origin}/features`, 3),
        "features/examiner-checks.html": withPlaceholders(
          `${origin}/features/examiner-checks`,
          1,
        ),
        "learn.html": page(`${origin}/learn`),
      }),
      [visualPlaceholders()],
    );
    expect(findings).toEqual([
      {
        rule: "visual-placeholders",
        severity: "warning",
        message: "/features (features.html) shows 3 visual placeholders",
      },
      {
        rule: "visual-placeholders",
        severity: "warning",
        message:
          "/features/examiner-checks (features/examiner-checks.html) shows 1 visual placeholder",
      },
    ]);
  });
});
