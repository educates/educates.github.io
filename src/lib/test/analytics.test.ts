import { describe, expect, it } from "vitest";
import { countingState, setCounting } from "../analytics.ts";

/** A browser's localStorage, holding the given items. */
function storage(items: Record<string, string> = {}) {
  const store = new Map(Object.entries(items));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
}

describe("countingState", () => {
  it("counts a browser that never opted out", () => {
    expect(countingState(() => storage())).toBe("on");
  });

  it("does not count a browser whose skipgc flag is t", () => {
    expect(countingState(() => storage({ skipgc: "t" }))).toBe("off");
  });

  it("counts a browser whose skipgc flag holds anything else, as count.js does", () => {
    expect(countingState(() => storage({ skipgc: "f" }))).toBe("on");
  });

  it("does not count a browser that blocks site storage", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    expect(countingState(blocked)).toBe("blocked");
  });
});

describe("setCounting", () => {
  it("opts a browser out with the flag count.js honors", () => {
    const local = storage();
    expect(setCounting(() => local, false)).toBe("off");
    expect(local.getItem("skipgc")).toBe("t");
  });

  it("opts a browser back in by clearing the flag", () => {
    const local = storage({ skipgc: "t" });
    expect(setCounting(() => local, true)).toBe("on");
    expect(local.getItem("skipgc")).toBeNull();
  });

  it("reports a browser that blocks site storage as not counted", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    expect(setCounting(blocked, true)).toBe("blocked");
  });
});
