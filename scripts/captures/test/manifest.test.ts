import { describe, expect, it } from "vitest";
import { site } from "../../../src/site.ts";
import { readFeatureEntries } from "../entries.ts";
import { shots } from "../manifest.ts";
import { coverageProblems, visualSlots, wiringProblems } from "../slots.ts";

describe("the capture manifest", () => {
  const entries = readFeatureEntries();

  it("fills every visual slot of the Feature entries with one shot of its kind", () => {
    const slots = visualSlots(entries, {
      educates4Released: site.educates4Released,
    });

    expect(coverageProblems(shots, slots)).toEqual([]);
  });

  it("has every shot wired into its Feature entry", () => {
    expect(wiringProblems(shots, entries)).toEqual([]);
  });

  it("names each shot once", () => {
    const ids = shots.map((shot) => shot.id);

    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });
});
