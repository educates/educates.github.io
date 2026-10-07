import type { Element, ElementContent } from "hast";
import type { HastPluginDefinition } from "satteri";

/** Elements that end an item's own text, such as a nested list. */
const blocks = new Set([
  "blockquote",
  "div",
  "figure",
  "ol",
  "p",
  "pre",
  "table",
  "ul",
]);

/**
 * Names the checkbox of each task list item, `- [ ]` or `- [x]`, by the
 * item's text: the checkbox and the text up to the item's first block, such
 * as a nested list, go in one `<label>`. In a loose list the label goes
 * inside the item's first paragraph, where the checkbox is.
 */
export function taskListLabels(): HastPluginDefinition {
  return {
    name: "task-list-labels",
    element: {
      filter: ["li"],
      visit(item) {
        if (startsWithCheckbox(item)) {
          return { ...item, children: labelled(item.children) };
        }
        const first = item.children.find(
          (child) => !(child.type === "text" && child.value.trim() === ""),
        );
        if (first?.type !== "element" || first.tagName !== "p") return;
        if (!startsWithCheckbox(first)) return;
        return {
          ...item,
          children: item.children.map((child) =>
            child === first
              ? { ...first, children: labelled(first.children) }
              : child,
          ),
        };
      },
    },
  };
}

function startsWithCheckbox(element: Element): boolean {
  const first = element.children[0];
  return (
    first?.type === "element" &&
    first.tagName === "input" &&
    first.properties.type === "checkbox"
  );
}

/**
 * `children`, starting with a checkbox, with the checkbox and the text after
 * it wrapped in a `<label>`. The label ends before the first block, and
 * leaves out the line breaks before it.
 */
function labelled(children: ElementContent[]): ElementContent[] {
  let end = children.findIndex(
    (child) => child.type === "element" && blocks.has(child.tagName),
  );
  if (end === -1) end = children.length;
  while (end > 1) {
    const last = children[end - 1];
    if (last.type !== "text" || last.value.trim() !== "") break;
    end -= 1;
  }
  const label: Element = {
    type: "element",
    tagName: "label",
    properties: {},
    children: children.slice(0, end),
  };
  return [label, ...children.slice(end)];
}
