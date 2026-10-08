import { site } from "../site.ts";

/**
 * The URL path of the page at `pathname`, in the site's URL form
 * (docs/adr/0002-keep-the-docusaurus-url-form.md): without `.html`, `/index`
 * or a trailing slash. At build time, under `build.format: 'file'`,
 * `Astro.url.pathname` ends in `.html`, such as `/index.html` or
 * `/about.html`; in the dev server it is the URL requested.
 */
export function pagePath(pathname: string): string {
  const path = pathname
    .replace(/\.html$/, "")
    .replace(/(^|\/)index$/, "")
    .replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/**
 * The GitHub page that edits the source file at `filePath`, a path from the
 * repository root such as `src/content/guides/setup/docker.md`, on the
 * branch pull requests target.
 */
export function editUrl(filePath: string): string {
  return `${site.repository}/edit/${site.sourceBranch}/${filePath}`;
}

/** The canonical URL of the page at `pathname`: its absolute `pagePath()`. */
export function canonicalUrl(pathname: string): string {
  return `${site.origin}${pagePath(pathname)}`;
}

/**
 * The URL of the Open Graph image generated for the page at `pathname`:
 * `/og/<path>.png`, and `/og/index.png` for the homepage. The image is
 * written after the build, by src/integrations/open-graph-images.ts.
 */
export function openGraphImageUrl(pathname: string): string {
  const path = pagePath(pathname);
  return `${site.origin}/og${path === "/" ? "/index" : path}.png`;
}
