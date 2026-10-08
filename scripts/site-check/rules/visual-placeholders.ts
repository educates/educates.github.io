import type { Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

/**
 * Lists the pages that still show a visual placeholder: a framed stand-in,
 * marked `data-visual-placeholder`, for a screenshot or a recording still
 * to be captured. Placeholders are expected until the visuals are
 * recaptured, so they are warnings, never errors.
 */
export function visualPlaceholders(): Rule {
  return {
    name: "visual-placeholders",
    check(build) {
      return build.pages().flatMap((file) => {
        const count = build
          .html(file)
          .querySelectorAll("[data-visual-placeholder]").length;
        if (count === 0) return [];
        return [
          {
            rule: "visual-placeholders",
            severity: "warning" as const,
            message: `${urlPathOf(file)} (${file}) shows ${count} visual placeholder${count === 1 ? "" : "s"}`,
          },
        ];
      });
    },
  };
}
