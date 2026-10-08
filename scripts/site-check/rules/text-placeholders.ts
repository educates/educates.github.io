import type { Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface TextPlaceholdersOptions {
  /** Literal texts that stand in for copy still to be filled in. */
  placeholders: string[];
}

/**
 * Lists the pages whose HTML still holds a text placeholder, such as the
 * privacy page's "[cutover date]". A placeholder is filled in only when its
 * value is known, so it is a warning, never an error.
 */
export function textPlaceholders({
  placeholders,
}: TextPlaceholdersOptions): Rule {
  return {
    name: "text-placeholders",
    check(build) {
      return build.pages().flatMap((file) => {
        const html = build.read(file);
        return placeholders
          .filter((placeholder) => html.includes(placeholder))
          .map((placeholder) => ({
            rule: "text-placeholders",
            severity: "warning" as const,
            message: `${urlPathOf(file)} (${file}) still says "${placeholder}": fill it in before the page ships`,
          }));
      });
    },
  };
}
