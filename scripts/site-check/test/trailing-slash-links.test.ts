import { describe, expect, it } from "vitest";
import { trailingSlashLinks } from "../rules/trailing-slash-links.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const origin = "https://educates.dev";

/** A page at `url` whose body links each of `hrefs`. */
function linking(url: string, ...hrefs: string[]): string {
  const links = hrefs.map((href) => `<a href="${href}">Link</a>`).join("");
  return page(url).replace("<h1>Page</h1>", `<h1>Page</h1>${links}`);
}

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild(files), [
    trailingSlashLinks({ origin, slashPaths: ["/", "/posts/"] }),
  ]);
}

describe("trailing-slash-links rule", () => {
  it("passes links in the site's URL form, the homepage, outside links and the slash paths it is given", () => {
    const findings = check({
      "index.html": linking(
        `${origin}/`,
        "/",
        "/#features",
        "/blog",
        "/getting-started-guides/setup#create",
        `${origin}/learn`,
        "https://docs.educates.dev/",
        "//hub.educates.dev/lab-workshop-session/",
        "/posts/",
        "mailto:info@educates.dev",
        "#main",
      ),
    });
    expect(findings).toEqual([]);
  });

  it("fails a link on the site that ends in a slash, which GitHub Pages answers with a 404", () => {
    const findings = check({
      "about-educates/workflows.html": linking(
        `${origin}/about-educates/workflows`,
        "/getting-started-guides/setup/",
        `${origin}/blog/?page=2`,
        "history/",
        "/learn/#guides",
      ),
    });
    expect(findings.map((finding) => finding.message)).toEqual([
      "about-educates/workflows.html links /getting-started-guides/setup/, which GitHub Pages answers with a 404: /getting-started-guides/setup/ ends in a slash",
      "about-educates/workflows.html links https://educates.dev/blog/?page=2, which GitHub Pages answers with a 404: /blog/ ends in a slash",
      "about-educates/workflows.html links history/, which GitHub Pages answers with a 404: /about-educates/history/ ends in a slash",
      "about-educates/workflows.html links /learn/#guides, which GitHub Pages answers with a 404: /learn/ ends in a slash",
    ]);
    expect(findings).toMatchObject(
      Array(4).fill({ rule: "trailing-slash-links", severity: "error" }),
    );
  });

  it("checks redirect pages too", () => {
    const findings = check({ "team.html": redirectPage("/community/") });
    expect(findings).toMatchObject([
      { rule: "trailing-slash-links", severity: "error" },
    ]);
  });
});
