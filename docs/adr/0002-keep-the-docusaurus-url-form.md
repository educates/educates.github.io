# Keep the Docusaurus URL form and feed identity

educates.dev keeps the URL form its Docusaurus site published: canonical
URLs without a trailing slash, each page built as `<path>.html` so that
GitHub Pages serves both `/page` and `/page.html`, and `/page/` a 404. In
Astro that is `build.format: 'file'` with `trailingSlash: 'never'`, not
Astro's default of directory URLs. The blog feeds keep their identity:
`/blog/rss.xml` and `/blog/atom.xml`, each item's RSS `guid` and Atom `id`
equal to `https://educates.dev/blog/<slug>`, and the Atom feed `id`
`https://educates.dev/blog`. Every URL the old site served is public, linked
from elsewhere and indexed, and a feed item whose ID changes reappears as a
new post for every subscriber.

## Considered Options

- **Astro's default directory URLs (`/page/`).** It would change all 67
  canonical page URLs and leave 67 HTML redirect pages, the only kind of
  redirect GitHub Pages serves, which carry no status code.
- **`@astrojs/rss` for the RSS feed.** It writes RSS only, so Atom would be
  a second, hand-written endpoint, and it adds a trailing slash to item
  links unless told not to. The `feed` library, which the Docusaurus site
  used, writes both formats from one source; given each post's `link` and
  no `id`, it produces the same `guid` and entry `id` as before.

## Consequences

- The site builds its own canonical URLs and `og:url`: under
  `build.format: 'file'`, `Astro.url.pathname` ends in `.html`.
- `@astrojs/sitemap` always writes an index plus numbered files, so a step
  at the end of the build renames `sitemap-0.xml` to `sitemap.xml` and
  deletes the index, keeping `/sitemap.xml` a single file.
- Astro's `redirects` cannot express a source with a trailing slash, so the
  predecessor site's `/posts/` URLs are redirect pages in `public/`.
- GitHub does not document the Pages behavior this URL form relies on, so
  a check of every published URL runs in CI against the build and once
  against the live site after a cutover.
- The old feeds' XSLT stylesheets, `/blog/rss.xsl` and `/blog/atom.xsl`
  with their CSS, are not kept, and the feeds link no stylesheet: only the
  feeds linked them, and Chrome stops running XSLT in November 2026, with
  Firefox and WebKit planning to follow.
- `/Downloads`, renamed to `/downloads` in 2025, has no redirect:
  `Downloads.html` and `downloads.html` are the same file on macOS's
  case-insensitive file system.
