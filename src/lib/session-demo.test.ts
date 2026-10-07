import { describe, expect, it } from "vitest";
import {
  editorStatus,
  sessionDemoLoop,
  sessionDemoStates,
  yamlTokens,
} from "./session-demo.ts";

describe("the Session demo's loop", () => {
  it("lasts about twenty seconds", () => {
    expect(sessionDemoLoop.length).toBeGreaterThanOrEqual(18_000);
    expect(sessionDemoLoop.length).toBeLessThanOrEqual(22_000);
  });

  it("shows Slides, then the Terminal, the Editor and the Console", () => {
    const tabs = sessionDemoLoop.steps
      .map((step) => step.state.tab)
      .filter((tab, index, all) => tab !== all[index - 1]);
    expect(tabs).toEqual(["slides", "terminal", "editor", "console"]);
  });

  it("clicks the three clickable actions in page order", () => {
    const pressed = sessionDemoLoop.steps
      .map((step) => step.state.actions.indexOf("pressed"))
      .filter((action, index, all) => action >= 0 && action !== all[index - 1]);
    expect(pressed).toEqual([0, 1, 2]);
  });

  it("passes the examiner check last, once every action is done", () => {
    const steps = sessionDemoLoop.steps;
    const passed = steps.findIndex((step) => step.state.check === "passed");
    expect(passed).toBe(steps.length - 1);
    for (const step of steps.slice(0, passed)) {
      expect(step.state.check).not.toBe("passed");
    }
    expect(steps[passed].state.actions).toEqual(["done", "done", "done"]);
  });

  it("keeps its steps in time order within the loop", () => {
    const times = sessionDemoLoop.steps.map((step) => step.at);
    expect(times[0]).toBe(0);
    times.slice(1).forEach((at, index) => {
      expect(at).toBeGreaterThan(times[index]);
    });
    expect(times[times.length - 1]).toBeLessThan(sessionDemoLoop.length);
  });

  it("starts from the start state and ends in the final state", () => {
    const steps = sessionDemoLoop.steps;
    expect(steps[0].state).toEqual(sessionDemoStates.start);
    expect(steps[steps.length - 1].state).toEqual(sessionDemoStates.final);
  });
});

describe("the Session demo's fixed states", () => {
  it("are each a moment of the loop", () => {
    const moments = sessionDemoLoop.steps.map((step) => step.state);
    for (const state of Object.values(sessionDemoStates)) {
      expect(moments).toContainEqual(state);
    }
  });

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

  it("show the matching text selected in the Editor", () => {
    expect(sessionDemoStates.editor).toMatchObject({
      tab: "editor",
      selected: true,
    });
  });

  it("show the deployment ready in the Console", () => {
    expect(sessionDemoStates.console).toMatchObject({
      tab: "console",
      ready: true,
    });
  });

  it("end with every action done and the check passed", () => {
    expect(sessionDemoStates.final).toMatchObject({
      actions: ["done", "done", "done"],
      check: "passed",
    });
  });
});

describe("the Session demo's Editor", () => {
  it("puts the cursor at the top of the file before the selection", () => {
    expect(editorStatus(sessionDemoStates.start)).toBe("Ln 1, Col 1");
  });

  it("reports the matching text selected as VS Code does", () => {
    expect(editorStatus(sessionDemoStates.editor)).toBe(
      "Ln 16, Col 27 (11 selected)",
    );
  });

  it("colors YAML keys, plain strings and numbers as Dark+ does", () => {
    expect(yamlTokens("kind: Deployment")).toEqual([
      { text: "kind", kind: "key" },
      { text: ": " },
      { text: "Deployment", kind: "string" },
    ]);
    expect(yamlTokens("      - containerPort: 8080")).toEqual([
      { text: "      - " },
      { text: "containerPort", kind: "key" },
      { text: ": " },
      { text: "8080", kind: "number" },
    ]);
    expect(yamlTokens("  template:")).toEqual([
      { text: "  " },
      { text: "template", kind: "key" },
      { text: ":" },
    ]);
  });
});
