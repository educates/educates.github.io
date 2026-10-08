import { describe, expect, it } from "vitest";
import { usedBySection, type UsedByLogo } from "../used-by.ts";

function logo(company: string): UsedByLogo {
  return {
    company,
    logo: { src: `/${company}.svg`, width: 120, height: 40, format: "svg" },
    acknowledged: new Date("2026-11-02"),
  };
}

describe("usedBySection", () => {
  it("is left out while no company has acknowledged its logo", () => {
    expect(usedBySection([])).toBeUndefined();
  });

  it("lists the acknowledged logos by company name, ranking no company", () => {
    const section = usedBySection([logo("Zeta"), logo("acme"), logo("Beta")]);
    expect(section?.logos.map((entry) => entry.company)).toEqual([
      "acme",
      "Beta",
      "Zeta",
    ]);
  });
});
