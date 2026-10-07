import { describe, expect, it } from "vitest";
import { currentCapabilities, useCasesRelyingOn } from "../use-cases.ts";

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

/** A capability resting on `features`. */
const resting = (...features: string[]) => ({
  title: "A capability",
  text: "What it gives the reader.",
  features,
});

const handsOnEvents = {
  id: "hands-on-events",
  data: {
    name: "Hands-on events",
    promise: "Every Attendee in a working environment.",
    page: {
      capabilities: [
        resting("ready-sessions"),
        resting("workshop-dashboard", "isolated-sessions"),
        resting("training-portal", "isolated-sessions"),
      ],
    },
  },
};
const demoPlatform = {
  id: "demo-platform",
  data: {
    name: "Build your own Demo Platform",
    promise: "One-click Demos for your field team.",
    page: {
      capabilities: [
        resting("portal-rest-api", "ready-sessions"),
        resting("isolated-sessions"),
      ],
    },
  },
};
const teamTraining = {
  id: "team-training",
  data: {
    name: "Team training",
    promise: "Train your engineers on real environments.",
  },
};

describe("useCasesRelyingOn", () => {
  it("lists each use case whose page names the Feature, once, in the order given", () => {
    expect(
      useCasesRelyingOn("isolated-sessions", [
        handsOnEvents,
        demoPlatform,
        teamTraining,
      ]),
    ).toEqual([
      {
        name: "Hands-on events",
        promise: "Every Attendee in a working environment.",
        href: "/use-cases/hands-on-events",
      },
      {
        name: "Build your own Demo Platform",
        promise: "One-click Demos for your field team.",
        href: "/use-cases/demo-platform",
      },
    ]);
  });

  it("leaves out use cases that do not name the Feature, and stubs without a page", () => {
    expect(
      useCasesRelyingOn("portal-rest-api", [
        handsOnEvents,
        demoPlatform,
        teamTraining,
      ]),
    ).toEqual([
      {
        name: "Build your own Demo Platform",
        promise: "One-click Demos for your field team.",
        href: "/use-cases/demo-platform",
      },
    ]);
    expect(
      useCasesRelyingOn("examiner-checks", [
        handsOnEvents,
        demoPlatform,
        teamTraining,
      ]),
    ).toEqual([]);
  });
});
