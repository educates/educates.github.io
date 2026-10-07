import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { redirects, staticRedirects } from "../../../src/redirects.ts";
import { fixtureBuild, page, redirectPage } from "./fixture-build.ts";

const cli = fileURLToPath(new URL("../cli.ts", import.meta.url));

function runSiteCheck(buildDir: string) {
  const result = spawnSync(process.execPath, [cli, buildDir], {
    encoding: "utf8",
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

describe("site-check command", () => {
  it("passes a build with warnings only, and lists them", () => {
    const { status, output } = runSiteCheck(
      fixtureBuild({
        "index.html": page("https://educates.dev/"),
        "sitemap.xml": sitemap("https://educates.dev/"),
        ...redirectsAndTargets(),
      }),
    );
    expect(output).toContain("/downloads (Site pages) is not served");
    expect(status).toBe(0);
  });

  it("fails a build with a malformed canonical URL", () => {
    const { status, output } = runSiteCheck(
      fixtureBuild({
        "index.html": page("https://educates.dev/index.html"),
        "sitemap.xml": sitemap("https://educates.dev/"),
      }),
    );
    expect(output).toContain("index.html: canonical URL");
    expect(status).toBe(1);
  });

  it("fails a build whose /posts/ redirect page sends the visitor elsewhere than the blog", () => {
    const { status, output } = runSiteCheck(
      fixtureBuild({
        "index.html": page("https://educates.dev/"),
        "sitemap.xml": sitemap("https://educates.dev/"),
        ...redirectsAndTargets(),
        "posts/index.html": redirectPage("/"),
      }),
    );
    expect(output).toContain("/posts/ redirects to /, not to /blog");
    expect(status).toBe(1);
  });

  it("fails when the build directory does not exist", () => {
    const { status, output } = runSiteCheck("/nonexistent/site-check/dist");
    expect(output).toContain("/nonexistent/site-check/dist");
    expect(status).toBe(1);
  });
});

/** The site's redirect pages, and the pages on the site they point to. */
function redirectsAndTargets(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [source, target] of Object.entries({
    ...redirects,
    ...staticRedirects,
  })) {
    const file = source.endsWith("/")
      ? `${source.slice(1)}index.html`
      : `${source.slice(1)}.html`;
    files[file] = redirectPage(target);
    if (target.startsWith("/")) {
      files[`${target.slice(1)}.html`] = page(`https://educates.dev${target}`);
    }
  }
  return files;
}

function sitemap(...urls: string[]): string {
  const entries = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}
