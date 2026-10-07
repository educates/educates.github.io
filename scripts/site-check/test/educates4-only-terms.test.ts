import { describe, expect, it } from "vitest";
import { educates4OnlyTerms } from "../rules/educates4-only-terms.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page } from "./fixture-build.ts";

const origin = "https://educates.dev";

/** A page at `path` whose body says `text`. */
function pageSaying(path: string, text: string): string {
  return page(`${origin}${path}`).replace(
    "<h1>Page</h1>",
    `<h1>Page</h1>${text}`,
  );
}

const built = {
  "index.html": page(`${origin}/`),
  "use-cases/team-training.html": pageSaying(
    "/use-cases/team-training",
    "<p>Educates runs on a cluster you own.</p>",
  ),
  // A dated Blog post may say anything its date allows.
  "blog/deploying-educates-yourself.html": pageSaying(
    "/blog/deploying-educates-yourself",
    "<p>Air-gapped installs are coming.</p>",
  ),
};

function check(
  files: Record<string, string>,
  { educates4Released = false } = {},
) {
  return checkSite(fixtureBuild({ ...built, ...files }), [
    educates4OnlyTerms({
      educates4Released,
      paths: ["/use-cases"],
      terms: [/air[\s-]?gapped/i],
    }),
  ]);
}

describe("educates4-only-terms rule", () => {
  it("passes a build whose pages under the paths name nothing 4.0 brings", () => {
    expect(check({})).toEqual([]);
  });

  it.each([
    ["in the copy", "<p>Self-hosted, or air-gapped.</p>"],
    ["in another spelling", "<p>An Airgapped install.</p>"],
    [
      "in a link",
      '<a href="https://docs.educates.dev/en/stable/installation-guides/airgapped-installation.html">Install</a>',
    ],
  ])(
    "fails a page under the paths that names a 4.0-only term %s",
    (_, text) => {
      const findings = check({
        "use-cases/team-training.html": pageSaying(
          "/use-cases/team-training",
          text,
        ),
      });
      expect(findings).toMatchObject([
        { rule: "educates4-only-terms", severity: "error" },
      ]);
      expect(findings[0].message).toContain(
        "/use-cases/team-training (use-cases/team-training.html)",
      );
      expect(findings[0].message).toMatch(/air[\s-]?gapped/i);
    },
  );

  it("leaves pages outside the paths alone", () => {
    expect(
      check({
        "learn.html": pageSaying("/learn", "<p>Air-gapped, in a post.</p>"),
        "use-cases-archive.html": pageSaying(
          "/use-cases-archive",
          "<p>Air-gapped.</p>",
        ),
      }),
    ).toEqual([]);
  });

  it("passes any mention once Educates 4.0 is released", () => {
    expect(
      check(
        {
          "use-cases/team-training.html": pageSaying(
            "/use-cases/team-training",
            "<p>Self-hosted, or air-gapped.</p>",
          ),
        },
        { educates4Released: true },
      ),
    ).toEqual([]);
  });
});
