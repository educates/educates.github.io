import { describe, expect, it } from "vitest";
import { textPlaceholders } from "../rules/text-placeholders.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

/** A page at `path` whose body says `text`. */
function pageSaying(path: string, text: string): string {
  return page(`${origin}${path}`).replace(
    "<h1>Page</h1>",
    `<h1>Page</h1>${text}`,
  );
}

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild(files), [
    textPlaceholders({ placeholders: ["[cutover date]"] }),
  ]);
}

describe("text-placeholders rule", () => {
  it("passes pages whose placeholders are all filled in", () => {
    expect(
      check({
        "index.html": page(`${origin}/`),
        "privacy.html": pageSaying(
          "/privacy",
          "<p>Until 1 November 2026, this site used Google Analytics.</p>",
        ),
        "team.html": redirectPage("/community"),
      }),
    ).toEqual([]);
  });

  it("warns about each page that still holds a placeholder, naming it", () => {
    expect(
      check({
        "index.html": page(`${origin}/`),
        "privacy.html": pageSaying(
          "/privacy",
          "<p>Until [cutover date], this site used Google Analytics.</p>",
        ),
      }),
    ).toEqual([
      {
        rule: "text-placeholders",
        severity: "warning",
        message:
          '/privacy (privacy.html) still says "[cutover date]": fill it in before the page ships',
      },
    ]);
  });
});
