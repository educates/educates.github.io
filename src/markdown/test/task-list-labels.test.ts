import { markdownToHtml, type MarkdownToHtmlResult } from "satteri";
import { describe, expect, it } from "vitest";
import { taskListLabels } from "../task-list-labels.ts";

/** Markdown rendered to HTML as the site's pipeline does, with the plugin. */
function render(markdown: string): string {
  // The plugin is synchronous, so the compile is too.
  const result = markdownToHtml(markdown, {
    hastPlugins: [taskListLabels()],
  }) as MarkdownToHtmlResult;
  return result.html.trim();
}

describe("task list labels", () => {
  it("labels each checkbox with its item's text, keeping the formatting", () => {
    expect(render("- [x] Done *now*\n- [ ] Open\n")).toBe(
      [
        '<ul class="contains-task-list">',
        '<li class="task-list-item"><label><input type="checkbox" checked disabled> Done <em>now</em></label></li>',
        '<li class="task-list-item"><label><input type="checkbox" disabled> Open</label></li>',
        "</ul>",
      ].join("\n"),
    );
  });

  it("leaves a nested list out of its parent item's label", () => {
    expect(render("- [ ] Open\n    - [ ] Nested\n")).toBe(
      [
        '<ul class="contains-task-list">',
        '<li class="task-list-item"><label><input type="checkbox" disabled> Open</label>',
        '<ul class="contains-task-list">',
        '<li class="task-list-item"><label><input type="checkbox" disabled> Nested</label></li>',
        "</ul>",
        "</li>",
        "</ul>",
      ].join("\n"),
    );
  });

  it("labels the checkbox inside the paragraph of a loose list's item", () => {
    expect(render("- [x] One\n\n- [ ] Two\n")).toBe(
      [
        '<ul class="contains-task-list">',
        '<li class="task-list-item">',
        '<p><label><input type="checkbox" checked disabled> One</label></p>',
        "</li>",
        '<li class="task-list-item">',
        '<p><label><input type="checkbox" disabled> Two</label></p>',
        "</li>",
        "</ul>",
      ].join("\n"),
    );
  });

  it("leaves a list without checkboxes as it is", () => {
    expect(render("- One\n- Two\n")).toBe(
      "<ul>\n<li>One</li>\n<li>Two</li>\n</ul>",
    );
  });
});
