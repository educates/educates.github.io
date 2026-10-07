import { describe, expect, it } from "vitest";
import { aboutSection, type AboutPage } from "../about-section.ts";

/** The About Educates pages, out of order, as a collection may list them. */
const pages: AboutPage[] = [
  { id: "history", title: "History", order: 3 },
  { id: "index", title: "Architecture", order: 1 },
  { id: "workflows", title: "Workflows", order: 2 },
];

describe("About Educates section", () => {
  it("lists its pages in order under the section's name, Architecture first at the section's own URL", () => {
    expect(aboutSection(pages).sidebar).toEqual({
      label: "About Educates",
      href: "/about-educates",
      items: [
        { label: "Architecture", href: "/about-educates" },
        { label: "Workflows", href: "/about-educates/workflows" },
        { label: "History", href: "/about-educates/history" },
      ],
    });
  });

  it("gives each page its URL path", () => {
    const section = aboutSection(pages);
    expect(section.href("index")).toBe("/about-educates");
    expect(section.href("history")).toBe("/about-educates/history");
  });

  it("rejects a page nested below the section", () => {
    expect(() =>
      aboutSection([
        ...pages,
        { id: "workflows/deep", title: "Too deep", order: 4 },
      ]),
    ).toThrow(/workflows\/deep/);
  });
});
