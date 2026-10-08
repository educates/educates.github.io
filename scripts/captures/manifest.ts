// The capture manifest: every screenshot and recording on the Features
// pages, in the order they are taken. Each shot names the Feature entry and
// slot it fills, where it is taken from, the steps that set it up, and its
// alt text. Its files are named after its id, next to the Feature entries:
// `src/content/features/<id>.webp`, or for a loop `<id>.mp4` and
// `<id>-poster.webp`.
//
// Shots taken from the same Session run one after the other in it, so a
// shot can rely on the steps of the shots before it.

import type { CaptureKind, Slot } from "./slots.ts";

/**
 * The Sessions the shots use, each in a browser context of its own, so
 * each is a different anonymous learner: the workshop it runs, by the
 * title the portal lists it under.
 */
export const sessions = {
  tour: "Educates Feature Tour",
  left: "Educates Feature Tour",
  right: "Educates Feature Tour",
  vcluster: "Kubernetes Cluster Admin",
  python: "Python Without a Cluster",
  /** The workshop the local authoring shots create on this machine. */
  laptop: "My First Workshop",
} as const;

export type SessionName = keyof typeof sessions;

/** Where a shot is taken. */
export type Source =
  /** A Session's dashboard. */
  | { session: SessionName }
  /** Two Sessions' dashboards, side by side. */
  | { sessions: [SessionName, SessionName] }
  /** A page of the training portal, as an anonymous learner past its access code. */
  | { portal: string }
  /** A page of Example Academy, the front end in captures/custom-site. */
  | { site: string }
  /** A page on this machine, such as a workshop running in Docker. */
  | { url: string }
  /** A terminal on the machine running the captures. */
  | { terminal: TerminalScript }
  /** A terminal on the machine running the captures, over a page in the browser. */
  | { terminal: TerminalScript; over: Source };

/**
 * Commands run in a terminal on the machine running the captures, each
 * shown after a prompt as if typed, with its real output.
 */
export interface TerminalScript {
  /** The window's title. */
  title: string;
  /** Where the commands run: `workshop` (a scratch copy of a new workshop) or `repository`. */
  cwd: "scratch" | "workshop" | "repository";
  commands: TerminalCommand[];
  /** Columns and rows of the terminal; it is as tall as its content unless rows are set. */
  size?: { cols: number; rows?: number };
}

export interface TerminalCommand {
  /** The command as shown after the prompt. */
  show: string;
  /** The command run, when it differs from what is shown. */
  run?: string;
}

/**
 * One step of setting up a shot, run in order. Action numbers count the
 * clickable actions on the instructions page from 1.
 */
export type Step =
  /** Opens a page of the workshop instructions, by its file name. */
  | { page: string }
  /** Clicks a clickable action, and waits until it is done, or for `wait` ms. */
  | { click: number; wait?: number }
  /** Types into a field of a clickable action's form. */
  | { fill: number; field: string; value: string }
  /** Submits a clickable action's form, and waits until the action is done. */
  | { submit: number }
  /** Uploads a fixture file through a clickable action's upload form. */
  | { upload: number; file: string }
  /** Brings a dashboard tab to the front. */
  | { tab: string }
  /** Shows a view of the Kubernetes console, such as `pod` or `deployment`. */
  | { console: string }
  /** Clicks an element of the page, outside a Session, such as a button. */
  | { press: string }
  /** Moves the pointer over an element of the Session's dashboard, such as its countdown. */
  | { hover: string }
  /** Reloads a page, such as the portal's catalog, until it shows this text. */
  | { text: string }
  /** Waits. */
  | { pause: number }
  /** Scrolls the instructions so an action is at the top, or back to the top. */
  | { scroll: number | "top" };

export interface Shot {
  /** Its name, `<Feature id>/<name>`, which also names its files. */
  id: string;
  /** The Feature entry it belongs to. */
  feature: string;
  slot: Slot;
  kind: CaptureKind;
  /** Its alt text on the page. */
  alt: string;
  source: Source;
  /** Steps before the screenshot, or before a recording starts. */
  setup?: Step[];
  /** For a loop: the steps recorded. */
  steps?: Step[];
  /** For a loop: how long it runs, in seconds. */
  seconds?: number;
  /** The browser window, in CSS pixels. */
  viewport?: { width: number; height: number };
  /** For a screenshot: the part of the window to keep. */
  clip?: { x: number; y: number; width: number; height: number };
}

const tour = { session: "tour" } as const;

/** A wider window, for shots of the editor. */
const editorWindow = { width: 1152, height: 720 };

export const shots: Shot[] = [
  // The tour Session: one learner working through the capture workshop.
  {
    id: "workshop-instructions/data-variables",
    feature: "workshop-instructions",
    slot: "visual",
    kind: "screenshot",
    alt: "A Session's first instructions page, with the learner's own namespace and hostname filled in, beside the terminal that ran a command from it.",
    source: tour,
    setup: [{ page: "00-workshop-overview" }, { click: 1 }, { scroll: "top" }],
  },
  {
    id: "ready-sessions/countdown",
    feature: "ready-sessions",
    slot: "visual",
    kind: "screenshot",
    alt: "A Session that opened at once from one created ahead of time, with the time it has left counting down in the dashboard's top bar.",
    source: tour,
    setup: [{ hover: "#countdown-button" }],
    clip: { x: 410, y: 0, width: 736, height: 460 },
  },
  {
    id: "clickable-actions/run",
    feature: "clickable-actions",
    slot: "loop",
    kind: "loop",
    alt: "A command in the instructions is clicked, and it runs in the terminal beside them.",
    source: tour,
    setup: [{ page: "01-deploy-the-application" }],
    steps: [{ pause: 1200 }, { click: 1 }, { pause: 1500 }, { click: 2 }],
    seconds: 8,
  },
  {
    id: "clickable-actions/terminals",
    feature: "clickable-actions",
    slot: 0,
    kind: "screenshot",
    alt: "Two commands from the instructions, one in each terminal: the application applied in the first, and its pods watched as they start in the second.",
    source: tour,
    setup: [{ pause: 3000 }],
  },
  {
    id: "clickable-actions/actions",
    feature: "clickable-actions",
    slot: "visual",
    kind: "screenshot",
    alt: "Clickable actions in the instructions, checked off as they ran, beside the terminals where the last one ran a command in both at once.",
    source: tour,
    setup: [{ click: 3 }, { click: 4 }, { pause: 1500 }],
  },
  {
    id: "clickable-actions/editor",
    feature: "clickable-actions",
    slot: 1,
    kind: "screenshot",
    alt: "The editor, opened at the deployment by one action, with the image tag a second action selected by a regular expression, and actions below to replace it, set a YAML value and create a file.",
    source: tour,
    viewport: editorWindow,
    setup: [
      { page: "02-change-the-configuration" },
      { click: 1 },
      { pause: 2500 },
      { click: 2 },
      { pause: 1000 },
    ],
  },
  {
    id: "clickable-actions/dashboard",
    feature: "clickable-actions",
    slot: 2,
    kind: "screenshot",
    alt: "A dashboard tab that an action in the instructions created, showing the application the step deployed.",
    source: tour,
    setup: [
      { click: 3 },
      { click: 4 },
      { click: 5 },
      { click: 6 },
      { page: "03-open-the-application" },
      { click: 1 },
      { pause: 3000 },
    ],
  },
  {
    id: "workshop-dashboard/console",
    feature: "workshop-dashboard",
    slot: "visual",
    kind: "screenshot",
    alt: "The workshop dashboard: instructions on the left, and tabs for the terminals, the Kubernetes console, the editor, the slides and the workshop's own application, with the console listing the learner's pods.",
    source: tour,
    setup: [{ click: 3 }, { console: "pod" }, { pause: 2000 }],
  },
  {
    id: "clickable-actions/files",
    feature: "clickable-actions",
    slot: 3,
    kind: "screenshot",
    alt: "Actions that copied the application's address, downloaded the Session's kubeconfig and uploaded a reading list, which the terminal lists in the uploads directory.",
    source: tour,
    setup: [
      { page: "04-share-files" },
      { click: 1 },
      { click: 2 },
      { upload: 3, file: "reading-list.json" },
      { click: 4 },
      { pause: 1500 },
      { scroll: "top" },
    ],
  },
  {
    id: "clickable-actions/pace",
    feature: "clickable-actions",
    slot: 4,
    kind: "screenshot",
    alt: "An action that ran as the page opened, a section that ran its two commands one after the other when it was opened, and a question and an optional step still folded away.",
    source: tour,
    setup: [
      { page: "05-at-your-own-pace" },
      { pause: 3000 },
      { click: 2 },
      { pause: 6000 },
    ],
  },
  {
    id: "examiner-checks/passed",
    feature: "examiner-checks",
    slot: "visual",
    kind: "screenshot",
    alt: "A check in the instructions that passed, once the pod the step started was running.",
    source: tour,
    setup: [
      { page: "06-check-your-work" },
      { click: 1 },
      { pause: 5000 },
      { click: 2 },
      { pause: 1000 },
    ],
  },
  {
    id: "examiner-checks/test",
    feature: "examiner-checks",
    slot: 0,
    kind: "screenshot",
    alt: "A check that passed when clicked, beside the test it ran, open in the editor.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 3 }, { pause: 2500 }],
  },
  {
    id: "examiner-checks/wait",
    feature: "examiner-checks",
    slot: "loop",
    kind: "loop",
    alt: "A check waits on the page while a pod starts in the terminal, then turns to passed once the pod is running.",
    source: tour,
    setup: [{ tab: "Terminal" }, { page: "07-wait-for-it" }, { pause: 500 }],
    steps: [{ pause: 2000 }, { click: 2, wait: 0 }, { pause: 5000 }],
    seconds: 9,
  },
  {
    id: "examiner-checks/autostart",
    feature: "examiner-checks",
    slot: 1,
    kind: "screenshot",
    alt: "A check that started as the page opened, and passed on its own once the pod it waited for was running.",
    source: tour,
    setup: [{ pause: 1000 }],
  },
  {
    id: "examiner-checks/cascade",
    feature: "examiner-checks",
    slot: 2,
    kind: "screenshot",
    alt: "Two checks that passed one after the other from a single click, and the command the second one started, with its output in the terminal.",
    source: tour,
    setup: [
      { page: "08-one-step-at-a-time" },
      { click: 1, wait: 10000 },
      { pause: 1500 },
    ],
  },
  {
    id: "examiner-checks/question",
    feature: "examiner-checks",
    slot: 3,
    kind: "screenshot",
    alt: "A question in the instructions, answered in its form and checked as right, beside the deployment the answer came from.",
    source: tour,
    setup: [
      { page: "09-answer-a-question" },
      { fill: 1, field: "replicas", value: "3" },
      { submit: 1 },
      { click: 2 },
      { pause: 1500 },
    ],
  },
  {
    id: "examiner-checks/outside",
    feature: "examiner-checks",
    slot: 4,
    kind: "screenshot",
    alt: "A check whose test a separate service of the training team runs, written with that service's URL, open in the editor beside the instructions.",
    source: tour,
    viewport: editorWindow,
    setup: [
      { page: "10-checked-from-outside" },
      { click: 2 },
      { pause: 2500 },
      { click: 3 },
      { pause: 1000 },
    ],
  },
  {
    id: "built-in-services/docker-registry-git",
    feature: "built-in-services",
    slot: "visual",
    kind: "screenshot",
    alt: "A Session's two terminals: an image built with its Docker daemon and pushed to its own registry, and the source pushed to its own Git server.",
    source: tour,
    setup: [
      { page: "12-build-and-push" },
      { click: 1, wait: 0 },
      { click: 2, wait: 0 },
      { pause: 25000 },
    ],
  },
  {
    id: "isolated-sessions/namespace",
    feature: "isolated-sessions",
    slot: 0,
    kind: "screenshot",
    alt: "A learner's pods in a namespace of their own, the rest of the cluster forbidden to them, and admin access in their namespace but none to create namespaces.",
    source: tour,
    setup: [
      { page: "13-your-namespace" },
      { click: 1 },
      { pause: 2500 },
      { click: 2 },
      { click: 3 },
      { pause: 1500 },
    ],
  },
  {
    id: "isolated-sessions/quota",
    feature: "isolated-sessions",
    slot: 1,
    kind: "screenshot",
    alt: "The resource quota and the container limits that a Session's namespace gets from the workshop's budget.",
    source: tour,
    setup: [{ click: 4 }, { pause: 1500 }],
  },
  {
    id: "lookup-service/robot-account",
    feature: "lookup-service",
    slot: 0,
    kind: "screenshot",
    alt: "A terminal logging in to a training portal's REST API with its robot account, and listing the portal's workshops.",
    source: tour,
    setup: [
      { page: "14-portal-rest-api" },
      { click: 1 },
      { pause: 2000 },
      { click: 2 },
      { pause: 2000 },
    ],
  },
  {
    id: "portal-rest-api/request",
    feature: "portal-rest-api",
    slot: "visual",
    kind: "screenshot",
    alt: "Requests to a training portal's REST API: the workshops it serves, and a Session for one of the site's own users, with the URL to send them to.",
    source: tour,
    setup: [{ click: 3 }, { pause: 5000 }],
  },
  {
    id: "lookup-service/same-session",
    feature: "lookup-service",
    slot: 1,
    kind: "screenshot",
    alt: "Two requests for a Session for the same learner ID, answered with the same Session.",
    source: tour,
    setup: [{ click: 4 }, { pause: 5000 }],
  },
  {
    id: "lookup-service/clusters",
    feature: "lookup-service",
    slot: 2,
    kind: "screenshot",
    alt: "The lookup service's admin API listing the clusters it watches, and the training portals on them.",
    source: tour,
    setup: [
      { page: "15-lookup-service" },
      { click: 1 },
      { click: 2 },
      { pause: 2000 },
      { click: 3 },
      { pause: 2000 },
    ],
  },
  {
    id: "lookup-service/tenants",
    feature: "lookup-service",
    slot: 3,
    kind: "screenshot",
    alt: "The lookup service's configuration in the editor: tenants that pick clusters and portals by name or by label, and a client granted one of them.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 4 }, { pause: 2500 }],
  },
  {
    id: "lookup-service/request",
    feature: "lookup-service",
    slot: 4,
    kind: "screenshot",
    alt: "A request to the lookup service for a learner's Session, with their name and email address, a workshop parameter, the page to return to and a webhook for its events, and the Session it got.",
    source: tour,
    setup: [{ click: 5 }, { pause: 2000 }, { click: 6 }, { pause: 3000 }],
  },
  {
    id: "workshop-environments/java-workshop",
    feature: "workshop-environments",
    slot: "visual",
    kind: "screenshot",
    alt: "A workshop definition in the editor that starts from the Java workshop image, adds an extension package, and creates a database in each Session's namespace.",
    source: tour,
    viewport: editorWindow,
    setup: [
      { page: "16-workshop-environments" },
      { click: 1 },
      { pause: 2500 },
      { click: 2 },
      { pause: 1000 },
    ],
  },
  {
    id: "isolated-sessions/virtual-machine",
    feature: "isolated-sessions",
    slot: 3,
    kind: "screenshot",
    alt: "A workshop definition in the editor that creates a KubeVirt virtual machine for each Session.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 4 }, { pause: 2500 }, { click: 5 }, { pause: 1000 }],
  },
  {
    id: "terraform-modules/eks",
    feature: "terraform-modules",
    slot: "visual",
    kind: "screenshot",
    alt: "The configuration for the Educates Terraform root module for EKS in the editor, with the commands to create and destroy the cluster in the instructions.",
    source: tour,
    viewport: editorWindow,
    setup: [{ page: "17-terraform-modules" }, { click: 1 }, { pause: 2500 }],
  },
  {
    id: "ai-authoring-skills/generated-workshop",
    feature: "ai-authoring-skills",
    slot: "loop",
    kind: "loop",
    alt: "A workshop the authoring skill created, opened in a Session's editor: its workshop.yaml, its first instruction page, and the course plan it was built from.",
    source: tour,
    viewport: editorWindow,
    setup: [{ page: "18-ai-authoring" }, { click: 1 }, { pause: 2000 }],
    steps: [
      { pause: 1500 },
      { click: 2 },
      { pause: 2500 },
      { click: 3 },
      { pause: 2500 },
      { click: 4 },
    ],
    seconds: 9,
  },
  {
    id: "ai-authoring-skills/workshop-yaml",
    feature: "ai-authoring-skills",
    slot: "visual",
    kind: "screenshot",
    alt: "The workshop.yaml the workshop authoring skill created, with the session applications the workshop needs, open in a Session's editor.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 1 }, { pause: 2000 }],
  },
  {
    id: "ai-authoring-skills/instructions",
    feature: "ai-authoring-skills",
    slot: 0,
    kind: "screenshot",
    alt: "An instruction page the workshop authoring skill wrote, with a clickable action for each step, open in a Session's editor.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 2 }, { pause: 2000 }],
  },
  {
    id: "ai-authoring-skills/course-plan",
    feature: "ai-authoring-skills",
    slot: 1,
    kind: "screenshot",
    alt: "A course plan from the course design skill, with its workshops marked core or elective.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 3 }, { pause: 2000 }],
  },
  {
    id: "ai-authoring-skills/blueprint",
    feature: "ai-authoring-skills",
    slot: 2,
    kind: "screenshot",
    alt: "The detailed plan the course design skill wrote for one workshop: its metadata, its configuration and its learning objectives.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 4 }, { pause: 2000 }],
  },
  {
    id: "ai-authoring-skills/tasks",
    feature: "ai-authoring-skills",
    slot: 3,
    kind: "screenshot",
    alt: "The course's task list, by workshop and priority, with the work to do next.",
    source: tour,
    viewport: editorWindow,
    setup: [{ click: 5 }, { pause: 2000 }],
  },

  // Two learners side by side, then the other workshops of the tour.
  {
    id: "isolated-sessions/side-by-side",
    feature: "isolated-sessions",
    slot: "loop",
    kind: "loop",
    alt: "Two Sessions of the same workshop side by side, each listing only the pods in its own namespace.",
    source: { sessions: ["left", "right"] },
    viewport: { width: 1000, height: 1250 },
    // Deploys the application first, so the pods are running when listed.
    setup: [
      { page: "13-your-namespace" },
      { click: 1 },
      { pause: 15000 },
      { click: 5 },
      { scroll: "top" },
    ],
    steps: [
      { pause: 800 },
      { click: 1, wait: 0 },
      { pause: 3500 },
      { click: 2, wait: 0 },
    ],
    seconds: 9,
  },
  {
    id: "isolated-sessions/two-namespaces",
    feature: "isolated-sessions",
    slot: "visual",
    kind: "screenshot",
    alt: "Two Sessions of the same workshop side by side, each with its pods in a namespace of its own, and the rest of the cluster forbidden to both.",
    source: { sessions: ["left", "right"] },
    viewport: { width: 1000, height: 1250 },
    setup: [{ pause: 1500 }],
  },
  {
    id: "isolated-sessions/virtual-cluster",
    feature: "isolated-sessions",
    slot: 2,
    kind: "screenshot",
    alt: "A Session's virtual cluster: the learner lists its nodes and namespaces, is allowed everything, and creates a namespace and a custom resource definition.",
    source: { session: "vcluster" },
    setup: [
      { click: 1 },
      { pause: 2000 },
      { click: 2 },
      { click: 3 },
      { pause: 3000 },
    ],
  },
  {
    id: "isolated-sessions/no-kubernetes",
    feature: "isolated-sessions",
    slot: 4,
    kind: "screenshot",
    alt: "A Session with no Kubernetes access: Python and its tools in the first terminal, and kubectl with no cluster to reach in the second.",
    source: { session: "python" },
    setup: [
      { click: 1 },
      { pause: 1500 },
      { click: 2, wait: 0 },
      { pause: 6000 },
      { click: 3 },
      { pause: 3000 },
    ],
  },

  // The training portal, and Example Academy, a training team's own site.
  {
    id: "training-portal/catalog",
    feature: "training-portal",
    slot: "visual",
    kind: "screenshot",
    alt: "A training portal's catalog of workshops, each with its description and a button to start it.",
    source: { portal: "/workshops/catalog/" },
    viewport: { width: 900, height: 562 },
  },
  {
    id: "lookup-service/example-academy",
    feature: "lookup-service",
    slot: "visual",
    kind: "screenshot",
    alt: "Example Academy, a training team's own site, listing workshops it gets from the lookup service, with a button to start each.",
    source: { site: "/" },
    viewport: { width: 960, height: 600 },
  },
  {
    id: "lookup-service/start-a-session",
    feature: "lookup-service",
    slot: "loop",
    kind: "loop",
    alt: "A custom site lists workshops from the lookup service, and a click on one opens a new Session in the browser.",
    source: { site: "/" },
    steps: [{ pause: 1200 }, { press: "form.card button" }, { pause: 7000 }],
    seconds: 10,
  },
  {
    id: "embedding/portal-in-a-page",
    feature: "embedding",
    slot: "visual",
    kind: "screenshot",
    alt: "Example Academy, a training team's own site, with the training portal embedded in one of its pages.",
    source: { site: "/embed" },
    setup: [{ pause: 2000 }],
  },
  {
    id: "workshop-analytics/events",
    feature: "workshop-analytics",
    slot: "visual",
    kind: "screenshot",
    alt: "Events a training portal posted to a training team's webhook as learners worked: Sessions started, pages viewed, and the page each learner reached.",
    source: { site: "/events" },
  },
  {
    id: "portal-branding/example-academy",
    feature: "portal-branding",
    slot: "visual",
    kind: "screenshot",
    alt: "A training portal with a title and logo of its own, listing its workshops.",
    source: { portal: "/workshops/catalog/" },
    viewport: { width: 900, height: 562 },
  },

  // Terminals on the machine running the captures.
  {
    id: "local-authoring/local-cluster",
    feature: "local-authoring",
    slot: 0,
    kind: "screenshot",
    alt: "A terminal on a laptop showing the local Educates cluster that educates create-cluster set up, with its image registry running beside it.",
    source: {
      terminal: {
        title: "~",
        cwd: "scratch",
        commands: [
          { show: "educates local cluster status" },
          {
            show: "docker ps --format 'table {{.Names}}\\t{{.Image}}\\t{{.Status}}' --filter 'name=^educates-control-plane$' --filter 'name=^educates-registry$'",
          },
        ],
      },
    },
  },
  {
    id: "local-authoring/new-workshop",
    feature: "local-authoring",
    slot: 1,
    kind: "screenshot",
    alt: "A terminal on a laptop where educates new-workshop created a workshop's directory, with its instructions, its workshop definition and its settings for publishing.",
    source: {
      terminal: {
        title: "~/workshops",
        cwd: "scratch",
        commands: [
          {
            show: 'educates new-workshop lab-new-workshop --title "My First Workshop" --description "Written and tested on a laptop."',
            // A workshop left by an earlier run would make it ask first.
            run: 'rm -rf lab-new-workshop && educates new-workshop lab-new-workshop --title "My First Workshop" --description "Written and tested on a laptop."',
          },
          { show: "tree lab-new-workshop" },
        ],
      },
    },
  },
  {
    id: "publishing-workshops/publish",
    feature: "publishing-workshops",
    slot: "visual",
    kind: "screenshot",
    alt: "A terminal where educates publish-workshop packs a workshop's content as an OCI image and pushes it to a registry.",
    source: {
      terminal: {
        title: "~/workshops/lab-new-workshop",
        cwd: "workshop",
        commands: [{ show: "educates publish-workshop" }],
      },
    },
  },
  {
    id: "local-authoring/deploy-and-open",
    feature: "local-authoring",
    slot: 2,
    kind: "screenshot",
    alt: "A terminal on a laptop where educates deploy-workshop added the new workshop to the local cluster, over the training portal that now lists it.",
    source: {
      terminal: {
        title: "~/workshops/lab-new-workshop",
        cwd: "workshop",
        commands: [{ show: "educates deploy-workshop --portal site-captures" }],
      },
      over: { portal: "/workshops/catalog/" },
    },
    setup: [{ text: "My First Workshop" }],
  },
  {
    id: "local-authoring/serve-workshop",
    feature: "local-authoring",
    slot: 3,
    kind: "screenshot",
    alt: "A terminal on a laptop serving a workshop's instructions with educates serve-workshop, over a Session showing them.",
    source: {
      terminal: {
        title: "~/workshops/lab-new-workshop",
        cwd: "workshop",
        commands: [
          {
            show: "educates serve-workshop --patch-workshop --portal site-captures",
          },
        ],
      },
      over: { session: "laptop" },
    },
  },
  {
    id: "local-authoring/live-update",
    feature: "local-authoring",
    slot: "loop",
    kind: "loop",
    alt: "An instruction page is edited and saved on the laptop, and the running Session's instructions refresh to show the change.",
    source: {
      terminal: {
        title: "~/workshops/lab-new-workshop",
        cwd: "workshop",
        commands: [],
      },
      over: { session: "laptop" },
    },
    seconds: 9,
  },
  {
    id: "local-authoring/laptop",
    feature: "local-authoring",
    slot: "visual",
    kind: "screenshot",
    alt: "An instruction page in a terminal on a laptop, over the Session that shows it, served from the laptop as it is written.",
    source: {
      terminal: {
        title: "~/workshops/lab-new-workshop",
        cwd: "workshop",
        commands: [{ show: "cat workshop/content/00-workshop-overview.md" }],
      },
      over: { session: "laptop" },
    },
  },
  {
    id: "local-authoring/docker",
    feature: "local-authoring",
    slot: 4,
    kind: "screenshot",
    alt: "A terminal on a laptop where educates docker workshop deploy started a workshop in a single container on Docker, over that workshop open in the browser.",
    source: {
      terminal: {
        title: "~/workshops/lab-new-workshop",
        cwd: "workshop",
        commands: [
          { show: "educates docker workshop deploy --disable-open-browser" },
        ],
      },
      over: { url: "http://127.0.0.1:10081/" },
    },
  },
  {
    id: "installing-with-the-cli/render",
    feature: "installing-with-the-cli",
    slot: "visual",
    kind: "screenshot",
    alt: "A terminal with an Educates configuration file for GKE, and what educates admin platform render would install from it.",
    source: {
      terminal: {
        title: "~/educates",
        cwd: "repository",
        commands: [
          {
            show: "cat gke.yaml",
            run: "cat scripts/captures/fixtures/gke.yaml",
          },
          {
            show: "educates admin platform render --config gke.yaml | grep -E '^(kind|  name):'",
            run: "educates admin platform render --config scripts/captures/fixtures/gke.yaml | grep -E '^(kind|  name):'",
          },
        ],
      },
    },
  },
  {
    id: "runs-on-your-cluster/configurations",
    feature: "runs-on-your-cluster",
    slot: "visual",
    kind: "screenshot",
    alt: "A terminal with Educates configuration files for Amazon EKS and OpenShift, each a few lines naming the cluster's provider and domain.",
    source: {
      terminal: {
        title: "~/educates",
        cwd: "repository",
        commands: [
          {
            show: "cat eks.yaml",
            run: "cat scripts/captures/fixtures/eks.yaml",
          },
          {
            show: "cat openshift.yaml",
            run: "cat scripts/captures/fixtures/openshift.yaml",
          },
        ],
      },
    },
  },
  {
    id: "air-gapped-install/images",
    feature: "air-gapped-install",
    slot: "visual",
    kind: "screenshot",
    alt: "A terminal showing the image list a release publishes: one digest-pinned image reference per line, ready to mirror into your own registry.",
    source: {
      terminal: {
        title: "~/educates",
        cwd: "repository",
        commands: [
          {
            show: "cat educates-images-4.0.0-alpha.10.txt",
            run: "cat scripts/captures/fixtures/educates-images-4.0.0-alpha.10.txt",
          },
        ],
        size: { cols: 132 },
      },
    },
  },
  {
    id: "day-2-operations/portals",
    feature: "day-2-operations",
    slot: "visual",
    kind: "screenshot",
    alt: "A terminal listing the training portals on a cluster and the Sessions running in one with the educates CLI, and the secret copiers the secrets manager runs.",
    source: {
      terminal: {
        title: "~",
        cwd: "scratch",
        commands: [
          { show: "educates list-portals" },
          { show: "educates list-sessions --portal site-captures" },
          { show: "kubectl get secretcopiers | grep -v educates-cli" },
        ],
      },
    },
  },
  {
    id: "kyverno-security-policies/policies",
    feature: "kyverno-security-policies",
    slot: "visual",
    kind: "screenshot",
    alt: "A terminal listing the Kyverno policies Educates brings: those for the whole cluster, and those it adds for each workshop environment.",
    source: {
      terminal: {
        title: "~",
        cwd: "scratch",
        commands: [
          {
            show: "kubectl get validatingpolicies --no-headers -o custom-columns=NAME:.metadata.name | grep -v educates-environment | column -c 100",
          },
          {
            show: "kubectl get validatingpolicies --no-headers -o custom-columns=NAME:.metadata.name | grep site-captures-w01",
          },
        ],
      },
    },
  },
];
