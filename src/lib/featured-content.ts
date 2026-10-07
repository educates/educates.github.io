/**
 * Featured Content: the hand-picked Content the site promotes, in order.
 * The homepage shows the first three, and the Learn page pins the same
 * three above its list. An entry is named by its collection folder under
 * src/content and its id there: `posts/<slug>`, `guides/<part>`, such as
 * `guides/setup`, or `outside-content/<file name>`. An id that names no
 * Content fails the build.
 */
export const featuredContentIds: readonly string[] = [
  "posts/when-ai-content-isnt-slop",
  "posts/announcing-educates-hub",
  "posts/educates-independent",
];
