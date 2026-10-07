/** One page of a paginated list. */
export interface Page<T> {
  /** The page's number, from 1. */
  number: number;
  /** How many pages the list has. */
  count: number;
  /** The URL path of the page. */
  path: string;
  items: T[];
  /** The URL path of the page before, if there is one. */
  previous: string | undefined;
  /** The URL path of the page after, if there is one. */
  next: string | undefined;
}

/**
 * Splits `items` into pages of `size`, as the Docusaurus blog did: the first
 * page at `basePath`, such as `/blog`, and page N at `<basePath>/page/N`.
 * An empty list still has its first page.
 */
export function paginate<T>(
  items: readonly T[],
  basePath: string,
  size = 10,
): Page<T>[] {
  const count = Math.max(1, Math.ceil(items.length / size));
  const path = (number: number) =>
    number === 1 ? basePath : `${basePath}/page/${number}`;
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return {
      number,
      count,
      path: path(number),
      items: items.slice(index * size, number * size),
      previous: number > 1 ? path(number - 1) : undefined,
      next: number < count ? path(number + 1) : undefined,
    };
  });
}
