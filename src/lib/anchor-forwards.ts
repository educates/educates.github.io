// Old anchors whose sections moved to another page. A fragment never reaches
// the server, so a redirect cannot forward it: a small inline script on the
// page does, as soon as the page loads and whenever the fragment changes.

/** The homepage's old anchors whose sections now live elsewhere, by id. */
export const homepageAnchorForwards: Readonly<Record<string, string>> = {
  team: "/community#team",
};

/**
 * The source of an inline script that sends a visitor at one of the
 * anchors in `forwards`, by id, to its new place, replacing the history
 * entry so Back does not return to the forward. Any other anchor stays.
 */
export function anchorForwardScript(
  forwards: Readonly<Record<string, string>>,
): string {
  return `(function (forwards) {
  function forward() {
    var id = location.hash.slice(1);
    if (Object.prototype.hasOwnProperty.call(forwards, id)) {
      location.replace(forwards[id]);
    }
  }
  forward();
  addEventListener("hashchange", forward);
})(${JSON.stringify(forwards)});`;
}
