import { describe, expect, it, vi } from "vitest";
import {
  anchorForwardScript,
  homepageAnchorForwards,
} from "../anchor-forwards.ts";

/**
 * Runs the forward script as a browser would on a page at `hash`, and
 * returns where it sent the visitor and a way to change the hash later.
 */
function visit(script: string, hash: string) {
  const location = { hash, replace: vi.fn() };
  const listeners: Record<string, () => void> = {};
  const addEventListener = (type: string, listener: () => void) => {
    listeners[type] = listener;
  };
  new Function("location", "addEventListener", script)(
    location,
    addEventListener,
  );
  return {
    replace: location.replace,
    changeHash(next: string) {
      location.hash = next;
      listeners.hashchange?.();
    },
  };
}

describe("homepage anchor forwards", () => {
  const script = anchorForwardScript(homepageAnchorForwards);

  it("sends the old #team anchor to the team on the Community page", () => {
    expect(visit(script, "#team").replace).toHaveBeenCalledWith(
      "/community#team",
    );
  });

  it("leaves the anchors the homepage keeps alone", () => {
    for (const hash of ["#use-cases", "#features", "#pricing", "", "#"]) {
      expect(visit(script, hash).replace).not.toHaveBeenCalled();
    }
  });

  it("forwards #team typed into the address bar after the page loaded", () => {
    const page = visit(script, "#features");
    page.changeHash("#team");
    expect(page.replace).toHaveBeenCalledWith("/community#team");
  });

  it("forwards nothing for a name inherited from Object", () => {
    expect(visit(script, "#constructor").replace).not.toHaveBeenCalled();
  });
});
