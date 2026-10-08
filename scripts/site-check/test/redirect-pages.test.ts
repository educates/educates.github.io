import { describe, expect, it } from "vitest";
import { redirectPages } from "../rules/redirect-pages.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

const redirects = {
  "/team": "/community",
  "/docs": "https://docs.educates.dev",
};

/** A redirect page with exactly the head tags given. */
function redirectWithHead(head: string): string {
  return `<!doctype html><title>Redirecting</title>${head}<body><a href="/community">Redirecting</a></body>`;
}

const refresh = '<meta http-equiv="refresh" content="0;url=/community">';
const noindex = '<meta name="robots" content="noindex">';
const canonical = `<link rel="canonical" href="${origin}/community">`;

/** The build as Astro writes the configured redirects, plus their targets. */
const wellFormed = {
  "index.html": page(`${origin}/`),
  "community.html": page(`${origin}/community`),
  "team.html": redirectPage("/community"),
  "docs.html": redirectPage("https://docs.educates.dev/"),
};

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild({ ...wellFormed, ...files }), [
    redirectPages({ origin, redirects }),
  ]);
}

function messages(findings: { message: string }[]): string {
  return findings.map((finding) => finding.message).join("\n");
}

describe("redirect-pages rule", () => {
  it("passes redirect pages with an immediate meta refresh, noindex and a canonical link to the target", () => {
    expect(check({})).toEqual([]);
  });

  it("fails a redirect page whose meta refresh waits before redirecting", () => {
    const findings = check({
      "team.html": redirectWithHead(
        `<meta http-equiv="refresh" content="2;url=/community">${noindex}${canonical}`,
      ),
    });
    expect(findings).toMatchObject([
      { rule: "redirect-pages", severity: "error" },
    ]);
    expect(findings[0].message).toContain("team.html");
    expect(findings[0].message).toMatch(/immediate/);
  });

  it.each([
    [
      "a meta refresh without a target",
      `<meta http-equiv="refresh" content="0">${noindex}${canonical}`,
      /no target/,
    ],
    ["no noindex", `${refresh}${canonical}`, /noindex/],
    [
      "a robots meta tag that allows indexing",
      `${refresh}<meta name="robots" content="index, follow">${canonical}`,
      /noindex/,
    ],
    ["no canonical link", `${refresh}${noindex}`, /no canonical link/],
    [
      "a relative canonical link",
      `${refresh}${noindex}<link rel="canonical" href="/community">`,
      /canonical link \/community is not https:\/\/educates\.dev\/community/,
    ],
    [
      "a canonical link to another page",
      `${refresh}${noindex}<link rel="canonical" href="${origin}/team">`,
      /canonical link .*\/team is not https:\/\/educates\.dev\/community/,
    ],
  ])("fails a redirect page with %s", (_, head, message) => {
    const findings = check({ "team.html": redirectWithHead(head) });
    expect(findings).toMatchObject([
      { rule: "redirect-pages", severity: "error" },
    ]);
    expect(findings[0].message).toContain("team.html");
    expect(findings[0].message).toMatch(message);
  });

  it("fails a redirect page whose target on the site the build does not serve", () => {
    const findings = check({
      "resources.html": redirectPage("/learn"),
    });
    expect(findings).toMatchObject([
      { rule: "redirect-pages", severity: "error" },
    ]);
    expect(findings[0].message).toContain("resources.html");
    expect(findings[0].message).toMatch(/\/learn.*not served/);
  });

  it("fails a configured redirect the build does not serve", () => {
    const { "team.html": _, ...withoutTeam } = wellFormed;
    const findings = checkSite(fixtureBuild(withoutTeam), [
      redirectPages({ origin, redirects }),
    ]);
    expect(findings).toMatchObject([
      { rule: "redirect-pages", severity: "error" },
    ]);
    expect(findings[0].message).toMatch(/\/team .*not served/);
  });

  it("fails a configured redirect served as a page without a meta refresh", () => {
    const findings = check({
      "team.html": redirectWithHead(`${noindex}${canonical}`),
    });
    expect(findings).toMatchObject([
      { rule: "redirect-pages", severity: "error" },
    ]);
    expect(findings[0].message).toMatch(/\/team .*no meta refresh/);
  });

  it("fails a configured redirect whose page sends the visitor elsewhere", () => {
    const findings = check({ "team.html": redirectPage("/") });
    expect(findings).toMatchObject([
      { rule: "redirect-pages", severity: "error" },
    ]);
    expect(findings[0].message).toMatch(
      /\/team redirects to \/, not to \/community/,
    );
  });

  it("reports every problem of a redirect page", () => {
    const findings = check({
      "team.html": redirectWithHead(
        '<meta http-equiv="refresh" content="5;url=/community">',
      ),
    });
    expect(messages(findings)).toMatch(/immediate/);
    expect(messages(findings)).toMatch(/noindex/);
    expect(messages(findings)).toMatch(/no canonical link/);
  });
});
