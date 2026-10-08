/**
 * What makes `url` break the site's URL form
 * (docs/adr/0002-keep-the-docusaurus-url-form.md), or `undefined` if
 * nothing: an absolute URL on `origin`, with no query or fragment, and a
 * path without `.html`, `/index` or a trailing slash.
 */
export function urlFormProblem(
  url: string,
  origin: string,
): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "is not an absolute URL";
  }
  const { pathname } = parsed;
  if (parsed.origin !== origin) return `is not on ${origin}`;
  if (url.includes("?") || url.includes("#")) return "has a query or fragment";
  if (pathname.endsWith(".html")) return "ends in .html";
  if (pathname.endsWith("/index")) return "ends in /index";
  if (pathname !== "/" && pathname.endsWith("/")) return "has a trailing slash";
  return undefined;
}

/** The URL path a page file is served at: `index.html` is `/`, `a/b.html` is `/a/b`. */
export function urlPathOf(file: string): string {
  if (file === "index.html") return "/";
  return `/${file.replace(/\.html$/, "")}`;
}
