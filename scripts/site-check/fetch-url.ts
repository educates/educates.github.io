/** The `fetch` the checks use, replaceable in tests. */
export type FetchUrl = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

/** An error's message, followed by its cause's, as Node's fetch nests them. */
export function errorReason(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  return error.cause instanceof Error
    ? `${error.message}: ${error.cause.message}`
    : error.message;
}
