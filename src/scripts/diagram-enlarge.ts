// Click-to-enlarge for the page's Mermaid diagrams. astro-mermaid renders
// each `pre.mermaid` into an SVG in the browser, and renders it again when
// the theme changes. This script puts each diagram in a frame with an
// "Enlarge" button, shown once the SVG is there. The button, or a
// click on the diagram, shows a copy of the SVG in a modal dialog that fills
// most of the window; Escape, the close button or a click outside the
// diagram closes it, and focus goes back to the button. DiagramEnlarge.astro
// holds the frame's and the dialog's markup in a template.

/** Wires every Mermaid diagram on the page; does nothing on a page without. */
export function setUpDiagramEnlarge(): void {
  const diagrams = document.querySelectorAll<HTMLPreElement>("pre.mermaid");
  const template = document.querySelector<HTMLTemplateElement>(
    "template[data-diagram-enlarge]",
  );
  if (diagrams.length === 0 || !template) return;

  const dialog = template.content.querySelector("dialog")?.cloneNode(true) as
    HTMLDialogElement | undefined;
  const frameTemplate =
    template.content.querySelector<HTMLElement>("[data-diagram]");
  if (!dialog || !frameTemplate) return;
  const view = dialog.querySelector<HTMLElement>("[data-diagram-view]");
  if (!view) return;
  document.body.append(dialog);

  let opener: HTMLElement | undefined;
  const open = (diagram: HTMLPreElement, button: HTMLElement) => {
    const svg = diagram.querySelector("svg");
    if (!svg) return;
    const copy = svg.cloneNode(true) as SVGSVGElement;
    // Mermaid caps the diagram's width inline; the dialog sizes it instead.
    copy.removeAttribute("style");
    view.replaceChildren(copy);
    dialog.setAttribute("aria-label", nameOf(svg, "Enlarged diagram"));
    opener = button;
    dialog.showModal();
  };

  dialog.addEventListener("close", () => {
    view.replaceChildren();
    opener?.focus();
  });
  // A click on the backdrop lands on the dialog itself.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  for (const diagram of diagrams) {
    const frame = frameTemplate.cloneNode(true) as HTMLElement;
    const button = frame.querySelector<HTMLButtonElement>("button");
    if (!button) continue;
    diagram.before(frame);
    frame.prepend(diagram);

    // Rendering, and rendering again for a theme change, replaces the
    // diagram's children.
    const sync = () => {
      const svg = diagram.querySelector("svg");
      button.hidden = svg === null;
      frame.toggleAttribute("data-ready", svg !== null);
      button.setAttribute(
        "aria-label",
        svg
          ? nameOf(svg, "Enlarge diagram", "Enlarge diagram: ")
          : "Enlarge diagram",
      );
    };
    new MutationObserver(sync).observe(diagram, { childList: true });
    sync();

    button.addEventListener("click", () => open(diagram, button));
    diagram.addEventListener("click", () => open(diagram, button));
  }
}

/**
 * A name for the diagram from its accessible title, Mermaid's `accTitle`,
 * after `prefix`; `fallback` when it has none.
 */
function nameOf(svg: SVGSVGElement, fallback: string, prefix = ""): string {
  const title = svg.querySelector(":scope > title")?.textContent?.trim();
  return title ? `${prefix}${title}` : fallback;
}
