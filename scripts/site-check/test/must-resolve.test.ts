import { describe, expect, it } from "vitest";
import { checkSite } from "../site-check.ts";
import { mustResolve } from "../rules/must-resolve.ts";
import { parseMustResolveList } from "../must-resolve-list.ts";
import { fixtureBuild, page } from "./fixture-build.ts";

function check(files: Record<string, string>, listText: string) {
  const list = parseMustResolveList(listText);
  return checkSite(fixtureBuild(files), [mustResolve(list)]);
}

describe("must-resolve rule", () => {
  it("reports nothing when every entry is served", () => {
    const findings = check(
      { "blog.html": page("https://educates.dev/blog") },
      "[Blog]\n/blog\n",
    );
    expect(findings).toEqual([]);
  });

  it("fails an entry the build does not serve, naming it and its section", () => {
    const findings = check(
      { "blog.html": page("https://educates.dev/blog") },
      "[Site pages]\n/downloads\n[Blog]\n/blog\n",
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      rule: "must-resolve",
      severity: "error",
    });
    expect(findings[0].message).toContain("/downloads");
    expect(findings[0].message).toContain("Site pages");
  });
});

describe("must-resolve rule, resolving URLs as GitHub Pages does", () => {
  const build = {
    "index.html": page("https://educates.dev/"),
    "downloads.html": page("https://educates.dev/downloads"),
    "blog.html": page("https://educates.dev/blog"),
    "blog/page/2.html": page("https://educates.dev/blog/page/2"),
    "posts/index.html": "",
    "guides/index.html": "",
    "robots.txt": "",
    ".nojekyll": "",
    "img/favicon.ico": "",
  };
  const missing = (path: string) =>
    check(build, `[Entries]\n${path}\n`).map((finding) => finding.message);

  it.each([
    ["/", "the homepage from index.html"],
    ["/blog", "a page from <path>.html"],
    ["/blog.html", "a page by its file name"],
    ["/blog/page/2", "a nested page"],
    ["/posts/", "a slash URL from <path>/index.html"],
    ["/robots.txt", "a file"],
    ["/.nojekyll", "a dotfile"],
    ["/img/favicon.ico", "a nested file"],
  ])("serves %s (%s)", (path) => {
    expect(missing(path)).toEqual([]);
  });

  it.each([
    ["/blog/", "a slash URL with no <path>/index.html is a 404"],
    ["/guides", "a slashless URL is not served from <path>/index.html"],
    ["/Downloads", "paths are case-sensitive"],
    ["/blog/page", "a directory is not a page"],
  ])("does not serve %s (%s)", (path) => {
    expect(missing(path)).toHaveLength(1);
  });
});
