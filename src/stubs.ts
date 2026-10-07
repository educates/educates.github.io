/**
 * Stub pages: placeholders for pages of the site still to be written, so
 * every route in the page inventory exists and every link to it resolves.
 * `src/pages/[...stub].astro` renders each one in the stub layout, and the
 * site check reports every stub page in a build.
 *
 * To build one of these pages, add it under `src/pages/` and remove its
 * entry here; the build fails while both exist. Use case and Feature stubs
 * come from their collections instead, in `src/pages/use-cases/[slug].astro`
 * and `src/pages/features/[slug].astro`, and the homepage's is
 * `src/pages/index.astro`.
 */
export interface Stub {
  /** The URL path of the page. */
  path: string;
  title: string;
  description: string;
  /** The site section of the page; a page in a section gets breadcrumbs. */
  section?: string;
}

export const stubs: readonly Stub[] = [];
