import { describe, expect, it } from "vitest";
import { stubPages } from "../rules/stub-pages.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage, stubPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

const built = {
  "index.html": page(`${origin}/`),
  "community.html": page(`${origin}/community`),
  "team.html": redirectPage("/community"),
};

describe("stub-pages rule", () => {
  it("passes a build without stub pages", () => {
    const findings = checkSite(fixtureBuild(built), [stubPages()]);
    expect(findings).toEqual([]);
  });

  it("fails each stub page, naming its URL", () => {
    const findings = checkSite(
      fixtureBuild({
        ...built,
        "learn.html": stubPage(`${origin}/learn`),
        "features/examiner-checks.html": stubPage(
          `${origin}/features/examiner-checks`,
        ),
      }),
      [stubPages()],
    );
    expect(findings).toEqual([
      {
        rule: "stub-pages",
        severity: "error",
        message:
          "/features/examiner-checks (features/examiner-checks.html) is a stub page",
      },
      {
        rule: "stub-pages",
        severity: "error",
        message: "/learn (learn.html) is a stub page",
      },
    ]);
  });
});
