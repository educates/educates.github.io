# Astro for educates.dev, without Starlight

educates.dev is built with Astro 7 as a plain Astro site: no Starlight,
React 19 only for the islands that need the browser, and plain CSS with
design tokens as CSS custom properties alongside Astro's scoped component
styles. The site is mostly a marketing site with a custom look,
data-driven use case and Feature pages, a Content hub across every kind of
Content, and covers generated at build time. In Astro those are content
collections, static paths and endpoints. In Docusaurus they would be custom
plugins and swizzled theme components, which sit outside Docusaurus's
stability promise, with a Docusaurus 4 migration close behind.

## Considered Options

- **Docusaurus 3.10, then 4.** It keeps every Content file and URL with no
  migration. It was rejected because the custom design, the data-driven
  pages, the Content hub and the covers would all be custom code against
  Docusaurus internals. Performance did not decide it: the Docusaurus site
  scored 93 to 100 for Lighthouse mobile performance in October 2026, so
  either stack can meet the site's bar.
- **Starlight for About Educates and Getting Started Guides.** It would
  cover only those two sections, about a third of the site's URLs. It
  brings its own visual language to restyle, is still before 1.0, pins the
  Astro version it runs on, and turns on site search, which the site does
  not offer. One docs layout in the site's own design serves both
  sections. Starlight is the fallback if that layout proves costly, or if
  the sections grow into real documentation.
- **Tailwind CSS 4, or Bootstrap 5.3 as hub.educates.dev uses.** Plain CSS
  with tokens adds no dependency with its own release pace, and its custom
  properties are a layer the Hub can adopt without dropping Bootstrap.
  Tailwind is the fallback if the design system proves slow to write.

## Consequences

- The blog machinery is the site's own code: the post, tag, author,
  archive and pagination routes, the RSS and Atom feeds, and
  `/sitemap.xml`, all reproducing the URLs and feeds the Docusaurus site
  published.
- The site is never more than one Astro major behind the current one.
  Astro ships security fixes for the previous major only, and its majors
  have come between 3.5 and 15 months apart.
- React islands are limited to the Asciinema player, the diagram viewer
  and the Content hub filters, so React loads only on the pages that use
  them. The theme toggle and the phone menu are small inline scripts.
