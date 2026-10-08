import { describe, expect, it } from "vitest";
import { sessionDemoLoop, sessionDemoStates } from "../session-demo.ts";

describe("the Session demo's loop", () => {
  it("lasts about twenty seconds", () => {
    expect(sessionDemoLoop.length).toBeGreaterThanOrEqual(18_000);
    expect(sessionDemoLoop.length).toBeLessThanOrEqual(22_000);
  });

  it("shows Slides, then the Terminal, the Editor and the Console, and passes the examiner check last", () => {
    const states = sessionDemoLoop.steps.map((step) => step.state);
    const tabs = states
      .map((state) => state.tab)
      .filter((tab, index, all) => tab !== all[index - 1]);
    expect(tabs).toEqual(["slides", "terminal", "editor", "console"]);
    expect(states.map((state) => state.check === "passed")).toEqual(
      states.map((_, index) => index === states.length - 1),
    );
  });
});

describe("the Session demo's stills on the homepage", () => {
  it("start on the intro slide with nothing clicked", () => {
    expect(sessionDemoStates.start).toMatchObject({
      tab: "slides",
      actions: ["idle", "idle", "idle"],
      check: "waiting",
    });
  });

  it("show the command's whole output once the first action is done", () => {
    expect(sessionDemoStates.terminal).toMatchObject({
      tab: "terminal",
      actions: ["done", "idle", "idle"],
      terminal: 4,
    });
  });

  it("end with every action done and the check passed", () => {
    expect(sessionDemoStates.final).toMatchObject({
      actions: ["done", "done", "done"],
      check: "passed",
    });
  });
});
