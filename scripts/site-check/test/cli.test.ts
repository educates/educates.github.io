import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { redirects, staticRedirects } from "../../../src/redirects.ts";
import { parseMustResolveList } from "../must-resolve-list.ts";
import {
  atomFeed,
  fixtureBuild,
  openGraphImageTags,
  page,
  redirectPage,
  rssFeed,
} from "./fixture-build.ts";

const cli = fileURLToPath(new URL("../cli.ts", import.meta.url));

/**
 * A stand-in for the live site: `/sitemap.xml` lists the URLs in
 * `liveUrls`, and `/unavailable.xml` answers 503.
 */
let server: Server;
let liveUrls: string[] = [];
let serverUrl = "";

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === "/sitemap.xml") {
      response.setHeader("content-type", "application/xml");
      response.end(sitemap(...liveUrls));
    } else {
      response.statusCode = 503;
      response.end("Service Unavailable");
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  serverUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

/** Runs the site-check command on a build, with the live sitemap at `live`. */
async function runSiteCheck(
  buildDir: string,
  live = `${serverUrl}/sitemap.xml`,
): Promise<{ status: number; output: string }> {
  try {
    const { stdout, stderr } = await promisify(execFile)(
      process.execPath,
      [cli, buildDir, "--live-sitemap", live],
      { encoding: "utf8" },
    );
    return { status: 0, output: stdout + stderr };
  } catch (error) {
    const failed = error as { code: number; stdout: string; stderr: string };
    return { status: failed.code, output: failed.stdout + failed.stderr };
  }
}

describe("site-check command", () => {
  it("passes a build that serves everything, listing its warnings", async () => {
    liveUrls = ["https://educates.dev/", "https://educates.dev/blog"];
    const { status, output } = await runSiteCheck(
      fixtureBuild(servedSite()),
      `${serverUrl}/unavailable.xml`,
    );
    expect(output).toContain("0 errors, 1 warning");
    expect(output).toContain(
      `skipped: could not fetch ${serverUrl}/unavailable.xml (the server answered 503)`,
    );
    expect(status).toBe(0);
  });

  it("passes a build that serves every URL of the live sitemap", async () => {
    liveUrls = [
      "https://educates.dev/",
      "https://educates.dev/blog",
      "https://educates.dev/about-educates/deployment",
    ];
    const { status, output } = await runSiteCheck(fixtureBuild(servedSite()));
    expect(output).toContain("0 errors, 0 warnings");
    expect(status).toBe(0);
  });

  it("fails a build that does not serve an entry of the must-resolve list", async () => {
    liveUrls = [];
    const site = servedSite();
    delete site["downloads.html"];
    const { status, output } = await runSiteCheck(fixtureBuild(site));
    expect(output).toContain("/downloads (Site pages) is not served");
    expect(status).toBe(1);
  });

  it("fails a build that does not serve a URL of the live sitemap", async () => {
    liveUrls = ["https://educates.dev/blog/a-post-published-since"];
    const { status, output } = await runSiteCheck(fixtureBuild(servedSite()));
    expect(output).toContain(
      "https://educates.dev/blog/a-post-published-since is in the live sitemap but not served by the build",
    );
    expect(status).toBe(1);
  });

  it("fails a build with a stub page", async () => {
    liveUrls = [];
    const site = servedSite();
    site["downloads.html"] = site["downloads.html"].replace(
      "<body>",
      "<body data-stub>",
    );
    const { status, output } = await runSiteCheck(fixtureBuild(site));
    expect(output).toContain("1 error, 0 warnings");
    expect(output).toContain("/downloads (downloads.html) is a stub page");
    expect(status).toBe(1);
  });

  it("fails a build with a malformed canonical URL", async () => {
    liveUrls = [];
    const { status, output } = await runSiteCheck(
      fixtureBuild({
        ...servedSite(),
        "index.html": page("https://educates.dev/index.html"),
      }),
    );
    expect(output).toContain("index.html: canonical URL");
    expect(status).toBe(1);
  });

  it("fails a build whose /posts/ redirect page sends the visitor elsewhere than the blog", async () => {
    liveUrls = [];
    const { status, output } = await runSiteCheck(
      fixtureBuild({ ...servedSite(), "posts/index.html": redirectPage("/") }),
    );
    expect(output).toContain("/posts/ redirects to /, not to /blog");
    expect(status).toBe(1);
  });

  it("fails when the build directory does not exist", async () => {
    const { status, output } = await runSiteCheck(
      "/nonexistent/site-check/dist",
    );
    expect(output).toContain("/nonexistent/site-check/dist");
    expect(status).toBe(1);
  });
});

/**
 * A build that serves every entry of the committed must-resolve list, the
 * site's redirects, and the homepage and Community anchors, and passes
 * every rule.
 */
function servedSite(): Record<string, string> {
  const files: Record<string, string> = {
    ...sitePage(
      "index.html",
      "https://educates.dev/",
      '<section id="use-cases"></section><section id="description"></section><section id="features"></section><section id="featured-content"></section><section id="pricing"></section>',
    ),
    ...sitePage(
      "community.html",
      "https://educates.dev/community",
      '<section id="team"></section>',
    ),
    "sitemap.xml": sitemap("https://educates.dev/"),
    "blog/rss.xml": rssFeed(),
    "blog/atom.xml": atomFeed({}),
  };
  const allRedirects: Record<string, string> = {
    ...redirects,
    ...staticRedirects,
  };
  const list = parseMustResolveList(
    readFileSync(new URL("../must-resolve.txt", import.meta.url), "utf8"),
  );
  for (const { path } of list) {
    if (path in allRedirects || `${path.slice(1)}` in files) continue;
    if (path === "/404.html") {
      Object.assign(files, sitePage("404.html", "https://educates.dev/404"));
    } else if (/\.[a-z]+$/.test(path) || path === "/.nojekyll") {
      files[path.slice(1)] ??= "file";
    } else {
      Object.assign(
        files,
        sitePage(`${path.slice(1)}.html`, `https://educates.dev${path}`),
      );
    }
  }
  for (const [source, target] of Object.entries(allRedirects)) {
    const file = source.endsWith("/")
      ? `${source.slice(1)}index.html`
      : `${source.slice(1)}.html`;
    files[file] = redirectPage(target);
    if (target.startsWith("/") && !(`${target.slice(1)}.html` in files)) {
      Object.assign(
        files,
        sitePage(`${target.slice(1)}.html`, `https://educates.dev${target}`),
      );
    }
  }
  return files;
}

/**
 * A page at `file`, served at `url`, with the Open Graph image the base
 * layout points to and the image itself, and `body` after its heading.
 */
function sitePage(
  file: string,
  url: string,
  body = "",
): Record<string, string> {
  const path = new URL(url).pathname;
  const image = `og${path === "/" ? "/index" : path}.png`;
  return {
    [file]: page(
      url,
      openGraphImageTags(`https://educates.dev/${image}`),
    ).replace("<h1>Page</h1>", `<h1>Page</h1>${body}`),
    [image]: "PNG",
  };
}

function sitemap(...urls: string[]): string {
  const entries = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}
