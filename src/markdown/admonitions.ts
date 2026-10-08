import { fileURLToPath } from "node:url";
import type { Paragraph } from "mdast";
import type { MdastPluginDefinition, MdastVisitorContext } from "satteri";

/** The admonition types the site renders, and the title each shows by default. */
const titles: Readonly<Record<string, string>> = {
  note: "Note",
  tip: "Tip",
  info: "Info",
  warning: "Warning",
  danger: "Danger",
};

/**
 * Renders admonitions, Docusaurus's `:::type` blocks, as callouts: an
 * `<aside role="note">` with a title and the block's content. Sätteri must
 * parse directives (`features.directive`).
 *
 * Any other directive fails the build, so a type the site does not style
 * never renders as nothing.
 */
export function admonitions(): MdastPluginDefinition {
  return {
    name: "admonitions",
    options: { position: true },
    containerDirective(node, ctx) {
      if (!(node.name in titles)) {
        throw new Error(
          `Unknown directive :::${node.name} at ${where(ctx, node.position?.start.line)}; the admonition types are ${Object.keys(titles).join(", ")}`,
        );
      }
      const children = [...node.children];
      // A `[Title]` label arrives as the first child, a paragraph flagged
      // as the directive's label.
      const label =
        children[0]?.type === "paragraph" && children[0].data?.directiveLabel
          ? children.shift()
          : undefined;
      const title =
        label?.type === "paragraph" && label.children.length > 0
          ? label.children
          : [{ type: "text", value: titles[node.name] }];
      return element(
        "aside",
        { class: `callout callout-${node.name}`, role: "note" },
        [
          element("p", { class: "callout-title" }, title),
          element("div", { class: "callout-body" }, children),
        ],
      );
    },
    leafDirective(node, ctx) {
      throw new Error(
        `Unknown directive ::${node.name} at ${where(ctx, node.position?.start.line)}; the site renders only the admonitions, :::type blocks`,
      );
    },
    textDirective(node, ctx) {
      // A colon before a word in prose, as in `10:30` or `image:latest`,
      // parses as a text directive with neither a label nor attributes:
      // it is text.
      const { start, end } = node.position ?? {};
      const source =
        start?.offset === undefined || end?.offset === undefined
          ? undefined
          : ctx.source.slice(start.offset, end.offset);
      if (source === `:${node.name}`) return { type: "text", value: source };
      throw new Error(
        `Unknown directive :${node.name} at ${where(ctx, start?.line)}; the site renders only the admonitions, :::type blocks`,
      );
    },
  };
}

/** The file and line of a node, for error messages. */
function where(ctx: MdastVisitorContext, line: number | undefined): string {
  const file = ctx.fileURL ? fileURLToPath(ctx.fileURL) : "<unknown file>";
  return line === undefined ? file : `${file}:${line}`;
}

/**
 * An mdast node that renders as the HTML element `tagName`: a paragraph
 * whose `data.hName` and `data.hProperties` name the element and its
 * attributes, the convention of mdast-to-hast conversion.
 */
function element(
  tagName: string,
  properties: Record<string, string>,
  children: unknown[],
): Paragraph {
  const data = { hName: tagName, hProperties: properties };
  return {
    type: "paragraph",
    data: data as Paragraph["data"],
    children: children as Paragraph["children"],
  };
}
