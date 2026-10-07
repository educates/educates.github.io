// The docs layout's section navigation on phones, where it sits above the
// content behind a button. The button shows and hides the list; the list
// also closes when the window grows past the phone layout, where it is
// always shown. Without JavaScript the list is always shown.

import { PHONE_LAYOUT } from "./site-menus.ts";

export function setUpDocsNav(): void {
  const nav = document.querySelector<HTMLElement>("[data-docs-nav]");
  const toggle = nav?.querySelector<HTMLButtonElement>(
    "button[data-docs-nav-toggle]",
  );
  if (!nav || !toggle) return;

  const setOpen = (open: boolean) => {
    nav.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.hasAttribute("data-open"));
  });

  const phone = window.matchMedia(PHONE_LAYOUT);
  phone.addEventListener("change", () => {
    if (!phone.matches) setOpen(false);
  });
}
