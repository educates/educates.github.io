import { describe, expect, it } from "vitest";
import { repositoryLinks } from "../repositories.ts";

describe("repositoryLinks", () => {
  it("links each repository a page names to its page on GitHub, in its order, with its line", () => {
    expect(
      repositoryLinks(
        [
          {
            name: "educates/educates-workshop-authoring-skill",
            text: "Creates a workshop.",
          },
          {
            name: "educates/educates-course-design-skill",
            text: "Plans a course.",
          },
        ],
        "src/content/features/ai-authoring-skills.md",
      ),
    ).toEqual([
      {
        name: "educates/educates-workshop-authoring-skill",
        text: "Creates a workshop.",
        href: "https://github.com/educates/educates-workshop-authoring-skill",
      },
      {
        name: "educates/educates-course-design-skill",
        text: "Plans a course.",
        href: "https://github.com/educates/educates-course-design-skill",
      },
    ]);
  });

  it("fails on a name that is not an owner and a repository, naming it and who used it", () => {
    for (const name of [
      "https://github.com/educates/educates-course-design-skill",
      "educates-course-design-skill",
      "educates/educates-course-design-skill/",
    ]) {
      expect(() =>
        repositoryLinks(
          [{ name, text: "Plans a course." }],
          "src/content/features/ai-authoring-skills.md",
        ),
      ).toThrow(
        `src/content/features/ai-authoring-skills.md names repository "${name}", which is not of the form owner/name, such as educates/educates-course-design-skill`,
      );
    }
  });
});
