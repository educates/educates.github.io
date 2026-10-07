const WORDS_PER_MINUTE = 200;

/**
 * How many minutes a post takes to read, from its Markdown source, as the
 * Docusaurus blog counted it: the source's words (code included, as
 * `Intl.Segmenter` finds them) at 200 a minute, rounded up, and at least one.
 */
export function readingMinutes(source: string): number {
  const segmenter = new Intl.Segmenter("en", { granularity: "word" });
  let words = 0;
  for (const { isWordLike } of segmenter.segment(source)) {
    if (isWordLike) words += 1;
  }
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
