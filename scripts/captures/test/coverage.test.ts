import { describe, expect, it } from "vitest";
import { coverageProblems } from "../slots.ts";

const slots = [
  {
    feature: "training-portal",
    slot: "visual" as const,
    kind: "screenshot" as const,
  },
  { feature: "examiner-checks", slot: "loop" as const, kind: "loop" as const },
  { feature: "examiner-checks", slot: 0, kind: "screenshot" as const },
];

describe("coverageProblems", () => {
  it("finds nothing when each slot has one shot of its kind", () => {
    const shots = [
      {
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "examiner-checks/wait",
        feature: "examiner-checks",
        slot: "loop" as const,
        kind: "loop" as const,
      },
      {
        id: "examiner-checks/click",
        feature: "examiner-checks",
        slot: 0,
        kind: "screenshot" as const,
      },
    ];

    expect(coverageProblems(shots, slots)).toEqual([]);
  });

  it("names a slot no shot fills", () => {
    const shots = [
      {
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "examiner-checks/wait",
        feature: "examiner-checks",
        slot: "loop" as const,
        kind: "loop" as const,
      },
    ];

    expect(coverageProblems(shots, slots)).toEqual([
      "examiner-checks: thing 1 has no shot",
    ]);
  });

  it("names a slot two shots fill", () => {
    const shots = [
      {
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "training-portal/access-code",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "examiner-checks/wait",
        feature: "examiner-checks",
        slot: "loop" as const,
        kind: "loop" as const,
      },
      {
        id: "examiner-checks/click",
        feature: "examiner-checks",
        slot: 0,
        kind: "screenshot" as const,
      },
    ];

    expect(coverageProblems(shots, slots)).toEqual([
      "training-portal: visual has 2 shots: training-portal/catalog, training-portal/access-code",
    ]);
  });

  it("names a shot for a slot that does not exist", () => {
    const shots = [
      {
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
      {
        id: "examiner-checks/wait",
        feature: "examiner-checks",
        slot: "loop" as const,
        kind: "loop" as const,
      },
      {
        id: "examiner-checks/click",
        feature: "examiner-checks",
        slot: 0,
        kind: "screenshot" as const,
      },
      {
        id: "examiner-checks/form",
        feature: "examiner-checks",
        slot: 3,
        kind: "screenshot" as const,
      },
      {
        id: "embedding/iframe",
        feature: "embedding",
        slot: "visual" as const,
        kind: "screenshot" as const,
      },
    ];

    expect(coverageProblems(shots, slots)).toEqual([
      "examiner-checks/form: examiner-checks has no thing 4 to fill",
      "embedding/iframe: embedding has no visual to fill",
    ]);
  });

  it("names a shot of the wrong kind for its slot", () => {
    const shots = [
      {
        id: "training-portal/catalog",
        feature: "training-portal",
        slot: "visual" as const,
        kind: "loop" as const,
      },
      {
        id: "examiner-checks/wait",
        feature: "examiner-checks",
        slot: "loop" as const,
        kind: "loop" as const,
      },
      {
        id: "examiner-checks/click",
        feature: "examiner-checks",
        slot: 0,
        kind: "screenshot" as const,
      },
    ];

    expect(coverageProblems(shots, slots)).toEqual([
      "training-portal/catalog: a loop, but training-portal's visual takes a screenshot",
    ]);
  });
});
