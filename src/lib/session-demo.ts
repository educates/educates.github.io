// The Session demo's script: what the recreated Session dashboard shows at
// each moment of its loop, and the fixed states other pages show as stills.

/** The dashboard's tabs, in the order Educates shows them. */
export const sessionDemoTabs = [
  "terminal",
  "console",
  "editor",
  "slides",
] as const;

export type SessionDemoTab = (typeof sessionDemoTabs)[number];

/**
 * The state of a clickable action: not clicked yet, being clicked, waiting
 * on its result (as the Editor's actions do), or done.
 */
export type ClickableActionState = "idle" | "pressed" | "running" | "done";

/** Everything the demo shows at one moment. */
export interface SessionDemoState {
  /** The dashboard tab on show. */
  tab: SessionDemoTab;
  /**
   * The three clickable actions in the instructions, in page order: run a
   * command in the Terminal, select text in the Editor, open the Console.
   */
  actions: readonly [
    ClickableActionState,
    ClickableActionState,
    ClickableActionState,
  ];
  /** The action the pointer is on, or null when the pointer is hidden. */
  pointer: 0 | 1 | 2 | null;
  /**
   * The Terminal's progress: -1 before the command runs, then the number of
   * output lines shown below it.
   */
  terminal: number;
  /** Whether the Editor has the matching text selected. */
  selected: boolean;
  /** Whether the database's deployment is ready in the Console. */
  ready: boolean;
  /** The examiner check at the end of the step. */
  check: "waiting" | "running" | "passed";
}

/** A moment of the loop: the state the demo shows from `at` milliseconds. */
export interface SessionDemoStep {
  at: number;
  state: SessionDemoState;
}

/** One loop of the demo: its steps in time order, and when it starts over. */
export interface SessionDemoLoop {
  steps: readonly SessionDemoStep[];
  /** Milliseconds from the loop's start to the next loop's start. */
  length: number;
}

const start: SessionDemoState = {
  tab: "slides",
  actions: ["idle", "idle", "idle"],
  pointer: null,
  terminal: -1,
  selected: false,
  ready: false,
  check: "waiting",
};

/**
 * Moments of the loop that a page can show as stills, such as the
 * homepage's "What a workshop looks like" frames.
 *
 * - `start`: the step's intro slide, before anything is clicked.
 * - `terminal`: the first clickable action has run `kubectl apply` in the
 *   Terminal, the pointer still on it.
 * - `editor`: the second has opened the deployment in the Editor with the
 *   matching text selected.
 * - `console`: the third has opened the Console, where the database is
 *   ready.
 * - `final`: the examiner check has passed. The demo shows this state with
 *   reduced motion.
 */
export const sessionDemoStates = {
  start,
  terminal: {
    ...start,
    tab: "terminal",
    actions: ["done", "idle", "idle"],
    pointer: 0,
    terminal: 4,
  },
  editor: {
    ...start,
    tab: "editor",
    actions: ["done", "done", "idle"],
    pointer: 1,
    terminal: 4,
    selected: true,
  },
  console: {
    ...start,
    tab: "console",
    actions: ["done", "done", "done"],
    pointer: 2,
    terminal: 4,
    selected: true,
    ready: true,
  },
  final: {
    tab: "console",
    actions: ["done", "done", "done"],
    pointer: null,
    terminal: 4,
    selected: true,
    ready: true,
    check: "passed",
  },
} as const satisfies Record<string, SessionDemoState>;

export type SessionDemoStateName = keyof typeof sessionDemoStates;

/**
 * The Session's namespace, named as Educates names a Session: its training
 * portal, its workshop environment and its number.
 */
export const sessionNamespace = "lab-k8s-w01-s001";

/** What the Terminal shows: the workshop's first command runs here. */
export const sessionDemoTerminal = {
  /** Educates' shell prompt in the exercises directory. */
  prompt: "[~/exercises] $ ",
  /** A command run earlier in the workshop, and its output. */
  history: {
    command: "kubectl get namespace $SESSION_NAMESPACE",
    output: [
      "NAME               STATUS   AGE",
      `${sessionNamespace}   Active   4m`,
    ],
  },
  command: "kubectl apply -f database/",
  output: [
    "secret/blog-credentials created",
    "service/blog-db created",
    "persistentvolumeclaim/blog-database created",
    "deployment.apps/blog-db created",
  ],
} as const;

/** The file the Editor opens, and the text the clickable action selects. */
export const sessionDemoEditor = {
  folder: "database",
  file: "deployment.yaml",
  lines: [
    "apiVersion: apps/v1",
    "kind: Deployment",
    "metadata:",
    "  name: blog-db",
    "spec:",
    "  selector:",
    "    matchLabels:",
    "      app: blog-db",
    "  template:",
    "    metadata:",
    "      labels:",
    "        app: blog-db",
    "    spec:",
    "      containers:",
    "      - name: postgres",
    "        image: postgres:16",
  ],
  match: "postgres:16",
} as const;

/**
 * The demo's root attributes for a state, which its CSS reads: the tab on
 * show, the action the pointer is on (`none` when hidden), whether the
 * Editor's text is selected and the deployment ready, and the check.
 */
export function demoAttributes(
  state: SessionDemoState,
): Record<string, string> {
  return {
    "data-tab": state.tab,
    "data-pointer": state.pointer === null ? "none" : String(state.pointer),
    "data-selected": String(state.selected),
    "data-ready": String(state.ready),
    "data-check": state.check,
  };
}

/**
 * What the Terminal shows below its history: whether the command has run,
 * how many of its output lines are shown, and whether the prompt is back.
 */
export function terminalView(state: SessionDemoState): {
  command: boolean;
  output: number;
  prompt: boolean;
} {
  return {
    command: state.terminal >= 0,
    output: Math.max(0, state.terminal),
    prompt: state.terminal >= sessionDemoTerminal.output.length,
  };
}

/** Where the match is: its 0-based line, and its start and end columns. */
export function editorMatch(): { line: number; start: number; end: number } {
  const { lines, match } = sessionDemoEditor;
  const line = lines.findIndex((text) => text.includes(match));
  const start = lines[line].indexOf(match);
  return { line, start, end: start + match.length };
}

/**
 * The cursor position in the Editor's status bar. Selecting the matching
 * text leaves the cursor at the end of the match, and VS Code adds the
 * number of characters selected.
 */
export function editorStatus(state: SessionDemoState): string {
  if (!state.selected) return "Ln 1, Col 1";
  const { line, start, end } = editorMatch();
  return `Ln ${line + 1}, Col ${end + 1} (${end - start} selected)`;
}

/** A run of text on a line of YAML, colored by its kind if it has one. */
export interface YamlToken {
  text: string;
  kind?: "key" | "string" | "number";
}

/**
 * Splits a line of block-style YAML (`key: value`, with an optional list
 * dash) into the runs VS Code's Dark+ theme colors.
 */
export function yamlTokens(line: string): YamlToken[] {
  const parts = /^(\s*(?:- )?)([^:]+)(:\s*)(.*)$/.exec(line);
  if (!parts) return [{ text: line }];
  const [, lead, key, colon, value] = parts;
  const tokens: YamlToken[] = [];
  if (lead) tokens.push({ text: lead });
  tokens.push({ text: key, kind: "key" }, { text: colon });
  if (value) {
    tokens.push({
      text: value,
      kind: /^\d+$/.test(value) ? "number" : "string",
    });
  }
  return tokens;
}

/**
 * Builds the loop from changes, each made `after` milliseconds after the
 * one before it.
 */
function loop(
  changes: readonly [after: number, change: Partial<SessionDemoState>][],
  hold: number,
): SessionDemoLoop {
  const steps: SessionDemoStep[] = [{ at: 0, state: start }];
  let at = 0;
  for (const [after, change] of changes) {
    at += after;
    steps.push({ at, state: { ...steps[steps.length - 1].state, ...change } });
  }
  return { steps, length: at + hold };
}

export const sessionDemoLoop: SessionDemoLoop = loop(
  [
    // The step's intro slide, then a click runs the command in the Terminal.
    [1800, { pointer: 0 }],
    [
      800,
      { actions: ["pressed", "idle", "idle"], tab: "terminal", terminal: 0 },
    ],
    [300, { actions: ["done", "idle", "idle"] }],
    [300, { terminal: 1 }],
    [230, { terminal: 2 }],
    [230, { terminal: 3 }],
    [230, { terminal: 4 }],
    // A second click opens the deployment in the Editor and selects the image.
    [1300, { pointer: 1 }],
    [800, { actions: ["done", "pressed", "idle"], tab: "editor" }],
    [300, { actions: ["done", "running", "idle"] }],
    [500, { actions: ["done", "done", "idle"], selected: true }],
    // A third opens the Console, where the database turns ready.
    [2200, { pointer: 2 }],
    [800, { actions: ["done", "done", "pressed"], tab: "console" }],
    [300, { actions: ["done", "done", "done"] }],
    [1100, { ready: true }],
    // Then the examiner check passes.
    [800, { pointer: null, check: "running" }],
    [1500, { check: "passed" }],
  ],
  6000,
);
