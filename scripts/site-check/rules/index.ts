import { readFileSync } from "node:fs";
import { parseMustResolveList } from "../must-resolve-list.ts";
import type { Rule } from "../site-check.ts";
import { mustResolve } from "./must-resolve.ts";

/**
 * The rules the site-check command runs over every build. A rule is a
 * function in this folder that returns a `Rule`; add it here to run it,
 * and test it against small fixture builds in `../test/`.
 */
export function siteRules(): Rule[] {
  const mustResolveList = parseMustResolveList(
    readFileSync(new URL("../must-resolve.txt", import.meta.url), "utf8"),
  );
  return [
    // Missing entries warn; `missing: "error"` makes them block the build.
    mustResolve(mustResolveList, { missing: "warning" }),
  ];
}
