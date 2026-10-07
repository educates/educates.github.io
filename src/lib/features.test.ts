import { describe, expect, it } from "vitest";
import {
  currentFeatures,
  featuresByJob,
  homepageFeaturesByJob,
  type FeatureFields,
  type JobFeatures,
} from "./features.ts";

/** A Feature entry with the given id and fields over plain defaults. */
function feature(id: string, fields: Partial<FeatureFields> = {}) {
  return {
    id,
    data: {
      job: "authoring",
      sentence: `What ${id} does.`,
      flagship: false,
      order: 1,
      educates4Only: false,
      ...fields,
    } satisfies FeatureFields,
  };
}

/** Each job's name with the ids of its Features, in the order given. */
function idsByJob(groups: JobFeatures<ReturnType<typeof feature>>[]) {
  return groups.map((group) => [
    group.job.name,
    group.features.map((entry) => entry.id),
  ]);
}

describe("featuresByJob", () => {
  it("lists authoring, delivering and operating, each with its Features in order", () => {
    const groups = featuresByJob([
      feature("terraform-modules", { job: "operating", order: 34 }),
      feature("examiner-checks", { job: "authoring", order: 3 }),
      feature("lookup-service", { job: "delivering", order: 17 }),
      feature("clickable-actions", { job: "authoring", order: 2 }),
      feature("isolated-sessions", { job: "delivering", order: 11 }),
    ]);

    expect(idsByJob(groups)).toEqual([
      ["Authoring", ["clickable-actions", "examiner-checks"]],
      ["Delivering", ["isolated-sessions", "lookup-service"]],
      ["Operating", ["terraform-modules"]],
    ]);
  });
});

describe("currentFeatures", () => {
  const entries = [
    feature("installing-with-the-cli", { job: "operating" }),
    feature("air-gapped-install", { job: "operating", educates4Only: true }),
  ];

  it("leaves out 4.0-only Features while Educates 4.0 is unreleased", () => {
    const current = currentFeatures(entries, { educates4Released: false });

    expect(current.map((entry) => entry.id)).toEqual([
      "installing-with-the-cli",
    ]);
  });

  it("shows a Feature's 4.0 sentence, naming its 4.0-only parts, only once Educates 4.0 is released", () => {
    const installing = feature("installing-with-the-cli", {
      job: "operating",
      sentence: "Install with the educates CLI.",
      educates4Sentence: "Install with the educates CLI, or with Helm.",
    });

    const [before] = currentFeatures([installing], {
      educates4Released: false,
    });
    const [after] = currentFeatures([installing], { educates4Released: true });

    expect(before?.data.sentence).toBe("Install with the educates CLI.");
    expect(after?.data.sentence).toBe(
      "Install with the educates CLI, or with Helm.",
    );
  });

  it("shows 4.0-only Features once Educates 4.0 is released", () => {
    const current = currentFeatures(entries, { educates4Released: true });

    expect(current.map((entry) => entry.id)).toEqual([
      "installing-with-the-cli",
      "air-gapped-install",
    ]);
  });
});

describe("homepageFeaturesByJob", () => {
  it("lists each job's homepage Features in their homepage place, leaving the rest out", () => {
    const groups = homepageFeaturesByJob([
      feature("workshop-instructions", { order: 1 }),
      feature("clickable-actions", { order: 2, homepage: 1 }),
      feature("ai-authoring-skills", { order: 22, homepage: 2 }),
      feature("workshop-dashboard", {
        job: "delivering",
        order: 10,
        homepage: 2,
      }),
      feature("isolated-sessions", {
        job: "delivering",
        order: 11,
        homepage: 1,
      }),
      feature("embedding", { job: "delivering", order: 18 }),
    ]);

    expect(idsByJob(groups)).toEqual([
      ["Authoring", ["clickable-actions", "ai-authoring-skills"]],
      ["Delivering", ["isolated-sessions", "workshop-dashboard"]],
      ["Operating", []],
    ]);
  });
});
