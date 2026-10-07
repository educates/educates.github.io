import { describe, expect, it } from "vitest";
import { currentCapabilities } from "../use-cases.ts";

const selfHosted = {
  title: "Training that stays inside",
  text: "Educates runs on a cluster you own.",
  features: ["runs-on-your-cluster"],
  educates4Text:
    "Educates runs on a cluster you own, air-gapped if it has to be.",
  educates4Features: ["runs-on-your-cluster", "air-gapped-install"],
};

const portal = {
  title: "A portal that stays fresh",
  text: "Workshop environments are replaced on a schedule.",
  features: ["training-portal"],
};

describe("currentCapabilities", () => {
  it("keeps each capability's text and Features until Educates 4.0 is released", () => {
    expect(
      currentCapabilities([selfHosted, portal], { educates4Released: false }),
    ).toEqual([
      {
        title: "Training that stays inside",
        text: "Educates runs on a cluster you own.",
        features: ["runs-on-your-cluster"],
      },
      {
        title: "A portal that stays fresh",
        text: "Workshop environments are replaced on a schedule.",
        features: ["training-portal"],
      },
    ]);
  });

  it("shows a capability's 4.0 text and Features once Educates 4.0 is released, and keeps the others as they are", () => {
    expect(
      currentCapabilities([selfHosted, portal], { educates4Released: true }),
    ).toEqual([
      {
        title: "Training that stays inside",
        text: "Educates runs on a cluster you own, air-gapped if it has to be.",
        features: ["runs-on-your-cluster", "air-gapped-install"],
      },
      {
        title: "A portal that stays fresh",
        text: "Workshop environments are replaced on a schedule.",
        features: ["training-portal"],
      },
    ]);
  });
});
