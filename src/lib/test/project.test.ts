import { describe, expect, it } from "vitest";
import { supportTheProject } from "../project.ts";

describe("supportTheProject", () => {
  it("is hidden while the Sponsors listing is not public", () => {
    expect(supportTheProject({ sponsorsListingPublic: false })).toBeUndefined();
  });

  it("links to the educates GitHub Sponsors listing once it is public", () => {
    expect(supportTheProject({ sponsorsListingPublic: true })).toMatchObject({
      title: "Support the project",
      href: "https://github.com/sponsors/educates",
    });
  });
});
