// The header menus and the phone sheet.
//
// Each header menu is a <details> element, which opens and closes with a
// click, Enter or Space without JavaScript. This script keeps one menu open
// at a time and closes it with Escape, a click elsewhere, or focus leaving
// it.
//
// The phone sheet is a modal <dialog>: the menu button opens it, and its
// close button, Escape, a link inside it, or the window growing past the
// phone layout close it. Without JavaScript the menu button is a link to
// the footer's site map instead.

/** The widths of the phone layout, where the page layouts go to one column. */
export const PHONE_LAYOUT = "(max-width: 960px)";

/**
 * The widths that show the phone sheet instead of the header menus; the
 * header's and the sheet's CSS use the same. Wider than the phone layout,
 * because the four header menus and the header's links need 1024px.
 */
export const PHONE_MENU = "(max-width: 1023px)";

export function setUpHeaderMenus(): void {
  const menus = [
    ...document.querySelectorAll<HTMLDetailsElement>("details[data-menu]"),
  ];

  for (const menu of menus) {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      for (const other of menus) if (other !== menu) other.open = false;
    });
    menu.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !menu.open) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    });
    menu.addEventListener("focusout", (event) => {
      const next = event.relatedTarget;
      if (menu.open && next instanceof Node && !menu.contains(next)) {
        menu.open = false;
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    for (const menu of menus) {
      if (menu.open && !menu.contains(target)) menu.open = false;
    }
  });
}

export function setUpPhoneSheet(): void {
  const sheet = document.querySelector<HTMLDialogElement>("dialog[data-sheet]");
  const opener = document.querySelector<HTMLButtonElement>(
    "button[data-sheet-open]",
  );
  if (!sheet || !opener) return;

  opener.addEventListener("click", () => {
    sheet.showModal();
    opener.setAttribute("aria-expanded", "true");
  });
  sheet.addEventListener("close", () => {
    opener.setAttribute("aria-expanded", "false");
  });
  sheet.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, [data-sheet-close]")) sheet.close();
  });

  const phone = window.matchMedia(PHONE_MENU);
  phone.addEventListener("change", () => {
    if (!phone.matches && sheet.open) sheet.close();
  });
}
