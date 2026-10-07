import { site } from "../site.ts";

/**
 * The canonical URL of the page at `pathname`, in the site's URL form
 * (docs/adr/0002-keep-the-docusaurus-url-form.md): absolute, without
 * `.html`, `/index` or a trailing slash. At build time, under
 * `build.format: 'file'`, `Astro.url.pathname` ends in `.html`, such as
 * `/index.html` or `/about.html`; in the dev server it is the URL requested.
 */
export function canonicalUrl(pathname: string): string {
  const path = pathname
    .replace(/\.html$/, "")
    .replace(/(^|\/)index$/, "")
    .replace(/\/+$/, "");
  return `${site.origin}${path === "" ? "/" : path}`;
}
