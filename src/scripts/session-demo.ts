// The live Session demo: its loop, its tabs and its Pause and Replay
// button.
//
// Each `[data-session-demo]` element arrives showing the loop's final
// state. Unless the visitor prefers reduced motion, the loop then plays from
// the start whenever the demo is on screen, with a Pause button. Choosing a
// tab, with a click or the arrow keys, pauses the loop and shows that tab,
// and the button turns into Replay, which plays the loop from the start.
// With reduced motion the demo keeps its final state, nothing moves, and
// the tabs still work.

import {
  demoAttributes,
  editorStatus,
  sessionDemoLoop,
  sessionDemoStates,
  terminalView,
  type ActionLook,
  type SessionDemoState,
  type SessionDemoTab,
} from "../lib/session-demo.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Wires every live Session demo on the page. */
export function setUpSessionDemos(): void {
  const demos = document.querySelectorAll<HTMLElement>("[data-session-demo]");
  for (const demo of demos) setUpSessionDemo(demo);
}

/** A click or a result in progress, settled as it would end. */
const settle = (look: ActionLook): ActionLook =>
  look === "pressed" || look === "running" ? "done" : look;

function setUpSessionDemo(root: HTMLElement): void {
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector);
  const findAll = (selector: string) => [
    ...root.querySelectorAll<HTMLElement>(selector),
  ];

  const tabs = findAll('[role="tab"]');
  const actions = findAll("[data-action]");
  const command = find('[data-terminal="command"]');
  const caret = find('[data-terminal="caret"]');
  const output = findAll('[data-terminal="output"]');
  const prompt = find('[data-terminal="prompt"]');
  const status = find("[data-editor-status]");
  const control = find<HTMLButtonElement>("[data-control]");
  const controlText = control?.querySelector(".control-text");
  const reducedMotion = window.matchMedia(REDUCED_MOTION);

  let shown: SessionDemoState = sessionDemoStates.final;
  let step = 0;
  let playing = false;
  let onScreen = false;
  let timer: number | undefined;

  const show = (state: SessionDemoState) => {
    shown = state;
    for (const [name, value] of Object.entries(demoAttributes(state))) {
      root.setAttribute(name, value);
    }
    actions.forEach((action, index) => {
      action.dataset.look = state.actions[index];
    });
    const terminal = terminalView(state);
    if (command) command.hidden = !terminal.command;
    if (caret) caret.hidden = terminal.command;
    output.forEach((line, index) => {
      line.hidden = index >= terminal.output;
    });
    if (prompt) prompt.hidden = !terminal.prompt;
    if (status) status.textContent = editorStatus(state);
    for (const tab of tabs) {
      const selected = tab.dataset.tabName === state.tab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
  };

  const showControl = (mode: "pause" | "replay" | null) => {
    if (!control || !controlText) return;
    control.hidden = mode === null;
    if (mode === null) return;
    control.dataset.control = mode;
    controlText.textContent = mode === "pause" ? "Pause" : "Replay";
  };

  // Waits out the current step, then shows the next, while the loop plays
  // and the demo is on screen in a visible page.
  const tick = () => {
    window.clearTimeout(timer);
    if (!playing || !onScreen || document.hidden) return;
    const { steps, length } = sessionDemoLoop;
    const next = step + 1;
    const wait =
      (next < steps.length ? steps[next].at : length) - steps[step].at;
    timer = window.setTimeout(() => {
      step = next < steps.length ? next : 0;
      show(steps[step].state);
      tick();
    }, wait);
  };

  const play = () => {
    playing = true;
    step = 0;
    show(sessionDemoLoop.steps[0].state);
    showControl("pause");
    tick();
  };

  // Stops the loop where it is, without the pointer or anything half done.
  const pause = () => {
    playing = false;
    window.clearTimeout(timer);
    const [first, second, third] = shown.actions;
    show({
      ...shown,
      actions: [settle(first), settle(second), settle(third)],
      pointer: null,
      check: shown.check === "running" ? "passed" : shown.check,
    });
    showControl("replay");
  };

  const choose = (tab: HTMLElement) => {
    if (playing) pause();
    show({ ...shown, tab: tab.dataset.tabName as SessionDemoTab });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => choose(tab));
    // Arrow keys, Home and End move between the tabs, as in any tab list.
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      const target = {
        ArrowLeft: index === 0 ? last : index - 1,
        ArrowRight: index === last ? 0 : index + 1,
        Home: 0,
        End: last,
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      tabs[target].focus();
      choose(tabs[target]);
    });
  });

  control?.addEventListener("click", () => (playing ? pause() : play()));

  new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    tick();
  }).observe(root);
  document.addEventListener("visibilitychange", tick);

  const start = () => {
    if (!reducedMotion.matches) {
      play();
      return;
    }
    playing = false;
    window.clearTimeout(timer);
    show(sessionDemoStates.final);
    showControl(null);
  };
  reducedMotion.addEventListener("change", start);
  start();
}
