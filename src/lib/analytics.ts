// Whether this browser is counted. GoatCounter counts page views; a
// visitor opts out on /privacy, which stores the flag that GoatCounter's
// count.js itself honors, and the site's loader checks the same flag before
// it loads the script at all.

/**
 * The localStorage key of the opt-out flag, and the value that means "do
 * not count this browser". count.js skips counting on exactly this value.
 */
export const OPT_OUT_KEY = "skipgc";
const OPTED_OUT = "t";

/** The browser storage the opt-out flag lives in: localStorage. */
export type FlagStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Whether this browser is counted: `on`, `off` when the visitor opted out,
 * or `blocked` when the browser blocks site storage, so no choice can be
 * read or kept and nothing is counted.
 */
export type CountingState = "on" | "off" | "blocked";

/** Reads the visitor's choice. `storage` returns localStorage, or throws when it is blocked. */
export function countingState(storage: () => FlagStorage): CountingState {
  try {
    return storage().getItem(OPT_OUT_KEY) === OPTED_OUT ? "off" : "on";
  } catch {
    // count.js reads the same storage before it counts, so it could not
    // count this browser either.
    return "blocked";
  }
}

/**
 * Keeps the visitor's choice from the toggle on /privacy: counted, or not
 * (`skipgc` set to `t`). Returns the state that holds afterwards.
 */
export function setCounting(
  storage: () => FlagStorage,
  counted: boolean,
): CountingState {
  try {
    if (counted) storage().removeItem(OPT_OUT_KEY);
    else storage().setItem(OPT_OUT_KEY, OPTED_OUT);
  } catch {
    // Blocked storage keeps nothing; countingState reports it.
  }
  return countingState(storage);
}
