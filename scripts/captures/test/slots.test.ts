import { describe, expect, it } from "vitest";
import { visualSlots } from "../slots.ts";

describe("visualSlots", () => {
  it("gives every Feature a screenshot on the overview, and a deep page a loop and a visual per thing", () => {
    const slots = visualSlots([
      { id: "training-portal", data: {} },
      {
        id: "examiner-checks",
        data: {
          page: {
            loop: { alt: "A check passes." },
            things: [
              { title: "Check a step" },
              { title: "Wait for it", loop: { alt: "It waits." } },
            ],
          },
        },
      },
    ]);

    expect(slots).toEqual([
      { feature: "training-portal", slot: "visual", kind: "screenshot" },
      { feature: "examiner-checks", slot: "visual", kind: "screenshot" },
      { feature: "examiner-checks", slot: "loop", kind: "loop" },
      { feature: "examiner-checks", slot: 0, kind: "screenshot" },
      { feature: "examiner-checks", slot: 1, kind: "loop" },
    ]);
  });

  it("includes 4.0-only Features, so their visuals are ready before 4.0 is released", () => {
    const entries = [
      { id: "air-gapped-install", data: { educates4Only: true } },
    ];

    expect(visualSlots(entries)).toEqual([
      { feature: "air-gapped-install", slot: "visual", kind: "screenshot" },
    ]);
  });
});
