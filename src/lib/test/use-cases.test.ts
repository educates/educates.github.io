import { describe, expect, it } from "vitest";
import { useCasesRelyingOn } from "../use-cases.ts";

const handsOnEvents = {
  id: "hands-on-events",
  data: {
    name: "Hands-on events",
    promise: "Every Attendee in a working environment.",
    page: {
      capabilities: [
        { features: ["ready-sessions"] },
        { features: ["workshop-dashboard", "isolated-sessions"] },
        { features: ["training-portal", "isolated-sessions"] },
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
        { features: ["portal-rest-api", "ready-sessions"] },
        { features: ["isolated-sessions"] },
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
