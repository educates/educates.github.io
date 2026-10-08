import { describe, expect, it } from "vitest";
import { parseMustResolveList } from "../../site-check/must-resolve-list.ts";
import { redirectPage } from "../../site-check/test/fixture-build.ts";
import { checkServedUrls } from "../url-check.ts";

/** How a fake host answers one URL. */
type Answer =
  | { status: 200; body?: string }
  | { status: 301 | 302; location: string }
  | { status: 404 | 503 };

/**
 * A `fetch` over a fake web: each absolute URL answers as `answers` says,
 * any other with a 404. HTTP redirects are followed unless the request
 * asks for `redirect: "manual"`, as the real `fetch` does. Records every
 * URL requested.
 */
function fakeWeb(answers: Record<string, Answer | Error>) {
  const requested: string[] = [];
  const answer = (url: string): Response => {
    const found = answers[url] ?? { status: 404 };
    if (found instanceof Error) throw found;
    if (found.status === 301 || found.status === 302) {
      return new Response(null, {
        status: found.status,
        headers: { location: found.location },
      });
    }
    return new Response(found.status === 200 ? (found.body ?? "") : "", {
      status: found.status,
    });
  };
  const fetchUrl = async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    let url = String(input);
    for (let hops = 0; ; hops++) {
      requested.push(url);
      const response = answer(url);
      const location = response.headers.get("location");
      if (init?.redirect === "manual" || location === null || hops > 5) {
        return response;
      }
      url = new URL(location, url).href;
    }
  };
  return { fetchUrl, requested };
}

const list = (text: string) => parseMustResolveList(text);

describe("checking the must-resolve list against a served site", () => {
  it("passes pages and files that answer 200 from the base URL", async () => {
    const { fetchUrl, requested } = fakeWeb({
      "http://localhost:8080/": { status: 200 },
      "http://localhost:8080/blog": { status: 200 },
      "http://localhost:8080/blog/rss.xml": { status: 200 },
    });
    const results = await checkServedUrls({
      baseUrl: "http://localhost:8080",
      entries: list("[Pages]\n/\n/blog\n[Feeds]\n/blog/rss.xml\n"),
      redirects: {},
      fetchUrl,
    });
    expect(results).toEqual([
      { path: "/", section: "Pages", ok: true, message: "200" },
      { path: "/blog", section: "Pages", ok: true, message: "200" },
      { path: "/blog/rss.xml", section: "Feeds", ok: true, message: "200" },
    ]);
    expect(requested.sort()).toEqual([
      "http://localhost:8080/",
      "http://localhost:8080/blog",
      "http://localhost:8080/blog/rss.xml",
    ]);
  });

  it("fails a page or file that answers anything but 200, an HTTP redirect included", async () => {
    const { fetchUrl } = fakeWeb({
      "https://educates.dev/favicon.ico": { status: 404 },
      "https://educates.dev/blog": {
        status: 301,
        location: "https://educates.dev/blog/",
      },
      "https://educates.dev/blog/": { status: 200 },
      "https://educates.dev/learn": { status: 503 },
    });
    const results = await checkServedUrls({
      baseUrl: "https://educates.dev",
      entries: list("[Assets]\n/favicon.ico\n[Pages]\n/blog\n/learn\n"),
      redirects: {},
      fetchUrl,
    });
    expect(results).toEqual([
      {
        path: "/favicon.ico",
        section: "Assets",
        ok: false,
        message: "answered 404, not 200",
      },
      {
        path: "/blog",
        section: "Pages",
        ok: false,
        message: "answered 301 to https://educates.dev/blog/, not 200",
      },
      {
        path: "/learn",
        section: "Pages",
        ok: false,
        message: "answered 503, not 200",
      },
    ]);
  });

  it("reports a URL that could not be fetched", async () => {
    const { fetchUrl } = fakeWeb({
      "https://educates.dev/": new TypeError("fetch failed", {
        cause: new Error("getaddrinfo ENOTFOUND educates.dev"),
      }),
    });
    const results = await checkServedUrls({
      baseUrl: "https://educates.dev",
      entries: list("[Pages]\n/\n"),
      redirects: {},
      fetchUrl,
    });
    expect(results).toEqual([
      {
        path: "/",
        section: "Pages",
        ok: false,
        message:
          "could not be fetched: fetch failed: getaddrinfo ENOTFOUND educates.dev",
      },
    ]);
  });
});

describe("checking redirect sources against a served site", () => {
  const entries = list(
    "[Redirect sources]\n/team\n/posts/\n/docs\n/resources\n",
  );
  const redirects = {
    "/team": "/community",
    "/posts/": "/blog",
    "/docs": "https://docs.educates.dev",
    "/resources": "/learn",
  };

  it("passes redirect pages that land on their targets, following an outside target's own redirects", async () => {
    const { fetchUrl } = fakeWeb({
      "http://localhost:8080/team": {
        status: 200,
        body: redirectPage("/community"),
      },
      "http://localhost:8080/community": { status: 200 },
      "http://localhost:8080/posts/": {
        status: 200,
        body: redirectPage("/blog"),
      },
      "http://localhost:8080/blog": { status: 200 },
      "http://localhost:8080/docs": {
        status: 200,
        body: redirectPage("https://docs.educates.dev"),
      },
      "https://docs.educates.dev/": {
        status: 302,
        location: "/en/stable/",
      },
      "https://docs.educates.dev/en/stable/": { status: 200 },
      "http://localhost:8080/resources": {
        status: 200,
        body: redirectPage("/learn"),
      },
      "http://localhost:8080/learn": { status: 200 },
    });
    const results = await checkServedUrls({
      baseUrl: "http://localhost:8080",
      entries,
      redirects,
      fetchUrl,
    });
    expect(results).toEqual([
      {
        path: "/team",
        section: "Redirect sources",
        ok: true,
        message: "redirects to /community, which answered 200",
      },
      {
        path: "/posts/",
        section: "Redirect sources",
        ok: true,
        message: "redirects to /blog, which answered 200",
      },
      {
        path: "/docs",
        section: "Redirect sources",
        ok: true,
        message: "redirects to https://docs.educates.dev, which answered 200",
      },
      {
        path: "/resources",
        section: "Redirect sources",
        ok: true,
        message: "redirects to /learn, which answered 200",
      },
    ]);
  });

  it("fails a redirect source that is missing, not a redirect page, sent elsewhere, or whose target does not answer 200", async () => {
    const { fetchUrl } = fakeWeb({
      "https://educates.dev/team": { status: 404 },
      "https://educates.dev/posts/": {
        status: 200,
        body: "<!doctype html><title>Posts</title><h1>Posts</h1>",
      },
      "https://educates.dev/docs": {
        status: 200,
        body: redirectPage("https://educates.dev/"),
      },
      "https://educates.dev/resources": {
        status: 200,
        body: redirectPage("/learn"),
      },
      "https://educates.dev/learn": { status: 404 },
    });
    const results = await checkServedUrls({
      baseUrl: "https://educates.dev",
      entries,
      redirects,
      fetchUrl,
    });
    expect(results.map(({ path, ok, message }) => [path, ok, message])).toEqual(
      [
        [
          "/team",
          false,
          "answered 404; it must be a redirect page to /community",
        ],
        [
          "/posts/",
          false,
          "is a page, not a redirect page; it must redirect to /blog",
        ],
        [
          "/docs",
          false,
          "redirects to https://educates.dev/, not to https://docs.educates.dev",
        ],
        ["/resources", false, "redirects to /learn, which answered 404"],
      ],
    );
  });

  it("fails a redirect page whose meta refresh names no target", async () => {
    const { fetchUrl } = fakeWeb({
      "https://educates.dev/team": {
        status: 200,
        body: '<!doctype html><meta http-equiv="refresh" content="0"><title>Team</title>',
      },
    });
    const results = await checkServedUrls({
      baseUrl: "https://educates.dev",
      entries: list("[Redirect sources]\n/team\n"),
      redirects,
      fetchUrl,
    });
    expect(results).toMatchObject([
      {
        path: "/team",
        ok: false,
        message:
          "its meta refresh names no target; it must redirect to /community",
      },
    ]);
  });
});
