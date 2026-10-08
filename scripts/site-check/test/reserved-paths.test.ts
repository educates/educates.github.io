import { describe, expect, it } from "vitest";
import { reservedPaths } from "../rules/reserved-paths.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

function check(files: Record<string, string>) {
  return checkSite(
    fixtureBuild({ "index.html": page(`${origin}/`), ...files }),
    [reservedPaths({ paths: ["/hub"] })],
  );
}

describe("reserved-paths rule", () => {
  it("passes a build with nothing under a reserved path", () => {
    const findings = check({
      "hubs.html": page(`${origin}/hubs`),
      "blog/hub.html": page(`${origin}/blog/hub`),
      "blog/tags/hub.html": page(`${origin}/blog/tags/hub`),
    });
    expect(findings).toEqual([]);
  });

  it.each([
    ["a page at the reserved path", "hub.html", page(`${origin}/hub`)],
    ["a file at the reserved path", "hub", "hub"],
    ["an index page under it", "hub/index.html", page(`${origin}/hub/`)],
    [
      "a page under it",
      "hub/workshops/lab-a.html",
      page(`${origin}/hub/workshops/lab-a`),
    ],
    ["a file under it", "hub/assets/workshop.yaml", "kind: Workshop"],
    ["a redirect page under it", "hub/old.html", redirectPage("/learn")],
  ])("fails %s", (_, file, content) => {
    const findings = check({ [file]: content });
    expect(findings).toMatchObject([
      { rule: "reserved-paths", severity: "error" },
    ]);
    expect(findings[0].message).toContain(file);
    expect(findings[0].message).toContain("/hub");
  });
});
