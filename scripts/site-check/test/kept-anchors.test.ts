import { describe, expect, it } from "vitest";
import { keptAnchors } from "../rules/kept-anchors.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page } from "./fixture-build.ts";

const origin = "https://educates.dev";

/** A page for `url` whose <main> holds `body`. */
function pageWith(url: string, body: string): string {
  return page(url).replace("<h1>Page</h1>", `<h1>Page</h1>${body}`);
}

function check(files: Record<string, string>, anchors: string[]) {
  return checkSite(fixtureBuild(files), [keptAnchors({ anchors })]);
}

describe("kept-anchors rule", () => {
  it("passes when each anchor's page has an element with its id", () => {
    const findings = check(
      {
        "index.html": pageWith(
          `${origin}/`,
          '<section id="use-cases"></section><div id="pricing"></div>',
        ),
        "community.html": pageWith(
          `${origin}/community`,
          '<section id="team"></section>',
        ),
      },
      ["/#use-cases", "/#pricing", "/community#team"],
    );
    expect(findings).toEqual([]);
  });

  it("fails an anchor whose page has no element with its id", () => {
    const findings = check(
      {
        "index.html": pageWith(
          `${origin}/`,
          '<section id="use-cases"></section><a href="#features">Features</a>',
        ),
      },
      ["/#use-cases", "/#features"],
    );
    expect(findings).toMatchObject([
      { rule: "kept-anchors", severity: "error" },
    ]);
    expect(findings[0].message).toContain("/#features");
    expect(findings[0].message).toContain("index.html");
  });

  it("fails an anchor whose page is not in the build", () => {
    const findings = check({ "index.html": page(`${origin}/`) }, [
      "/community#team",
    ]);
    expect(findings).toMatchObject([
      { rule: "kept-anchors", severity: "error" },
    ]);
    expect(findings[0].message).toContain("/community#team");
  });
});
