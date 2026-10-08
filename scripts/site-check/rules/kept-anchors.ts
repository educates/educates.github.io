import type { Rule } from "../site-check.ts";

export interface KeptAnchorsOptions {
  /**
   * URLs with a fragment that links from elsewhere rely on, such as
   * `/#features` or `/community#team`.
   */
  anchors: string[];
}

/**
 * Each kept anchor still lands on its section: the page at the anchor's
 * URL path is in the build and has an element whose `id` is the fragment.
 * Without one, a link to the anchor opens the page at its top.
 */
export function keptAnchors({ anchors }: KeptAnchorsOptions): Rule {
  return {
    name: "kept-anchors",
    check(build) {
      return anchors.flatMap((anchor) => {
        const [path, id] = anchor.split("#");
        const file = build.resolve(path);
        if (file === undefined) {
          return [
            {
              rule: "kept-anchors",
              severity: "error" as const,
              message: `${anchor}: no page is built at ${path}, so links to this anchor break`,
            },
          ];
        }
        const target = build
          .html(file)
          .querySelectorAll("[id]")
          .some((element) => element.id === id);
        return target
          ? []
          : [
              {
                rule: "kept-anchors",
                severity: "error" as const,
                message: `${anchor}: ${path} (${file}) has no element with id "${id}", so links to this anchor open the page at its top`,
              },
            ];
      });
    },
  };
}
