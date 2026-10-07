import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fixtureBuild, page } from "./fixture-build.ts";

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
      }),
    );
    expect(output).toContain("/downloads (Site pages) is not served");
    expect(status).toBe(0);
  });

  it("fails when the build directory does not exist", () => {
    const { status, output } = runSiteCheck("/nonexistent/site-check/dist");
    expect(output).toContain("/nonexistent/site-check/dist");
    expect(status).toBe(1);
  });
});

function sitemap(...urls: string[]): string {
  const entries = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}
