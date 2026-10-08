// Takes the shots of the capture manifest from the capture portal, writes
// their files next to the Feature entries, and wires each into its entry.

import { execFileSync, type ChildProcess } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import type { Page } from "puppeteer-core";
import sharp from "sharp";
import {
  Capture,
  defaultViewport,
  instructions,
  runSteps,
  screenshotScale,
  waitFor,
} from "./browser.ts";
import {
  clusterIngress,
  createBrandedPortal,
  deleteBrandedPortal,
  portalDetails,
  restartPortal,
  siteHost,
} from "./cluster.ts";
import { entryFile, featuresDir, readFeatureEntries } from "./entries.ts";
import {
  sessions,
  shots,
  type SessionName,
  type Shot,
  type Source,
  type TerminalScript,
} from "./manifest.ts";
import {
  overlay,
  sideBySide,
  writeLoop,
  writeWebp,
  type LoopLayout,
  type Recording,
} from "./media.ts";
import { record } from "./record.ts";
import {
  captureFiles,
  coverageProblems,
  visualSlots,
  wiringProblems,
} from "./slots.ts";
import {
  castLength,
  defaultTerminalSize,
  recordTerminal,
  screenRows,
  startInTerminal,
  terminalFontSize,
  terminalPrompt,
  terminalServer,
  typedCommand,
  type Cast,
} from "./terminal.ts";
import { wireCapture } from "./wire.ts";

const fixtures = resolve("scripts/captures/fixtures");

/** The workshop the local authoring shots create, publish and serve. */
const newWorkshop = {
  name: "lab-new-workshop",
  title: sessions.laptop,
  description: "Written and tested on a laptop.",
};

export async function main(args: string[]) {
  if (args[0] === "list") {
    for (const shot of shots) console.log(`${shot.id}  (${shot.kind})`);
    return;
  }
  if (args[0] === "check") {
    const entries = readFeatureEntries();
    const slots = visualSlots(entries);
    const problems = [
      ...coverageProblems(shots, slots),
      ...wiringProblems(shots, entries),
    ];
    for (const problem of problems) console.log(problem);
    console.log(`captures: ${shots.length} shots, ${problems.length} problems`);
    if (problems.length > 0) process.exitCode = 1;
    return;
  }
  const selected =
    args.length === 0
      ? shots
      : shots.filter((shot) =>
          args.some((arg) => shot.id === arg || shot.id.startsWith(`${arg}/`)),
        );
  if (selected.length === 0)
    throw new Error(`no shot matches ${args.join(", ")}`);
  await takeShots(selected);
}

interface Context {
  capture: Capture;
  terminals: Awaited<ReturnType<typeof terminalServer>>;
  /** Where the local authoring shots create their workshop. */
  workshops: string;
  /** Where frames are kept while a loop is encoded. */
  work: string;
  /** educates serve-workshop, while it runs, and what it printed. */
  serve?: { process: ChildProcess; output: [number, string][] };
}

async function takeShots(selected: readonly Shot[]) {
  const capture = await Capture.launch(() => {
    const ingress = clusterIngress();
    const details = portalDetails();
    return {
      portal: { url: details.url, accessCode: details.accessCode },
      siteUrl: `${ingress.protocol}://${siteHost}.${ingress.domain}`,
    };
  });
  const workshops = join(tmpdir(), "site-captures", "workshops");
  mkdirSync(workshops, { recursive: true });
  const context: Context = {
    capture,
    terminals: await terminalServer(),
    workshops,
    work: mkdtempSync(join(tmpdir(), "site-captures-frames-")),
  };
  try {
    for (const shot of selected) {
      const started = Date.now();
      console.log(`captures: ${shot.id}`);
      await take(shot, context);
      wire(shot);
      console.log(
        `captures: ${shot.id} took ${Math.round((Date.now() - started) / 1000)} s`,
      );
    }
  } finally {
    stopServing(context);
    removeDockerWorkshop(context);
    await context.terminals.close();
    await capture.close();
    rmSync(context.work, { recursive: true, force: true });
  }
}

/** Writes the shot's files into its Feature entry. */
function wire(shot: Shot) {
  const file = entryFile(shot.feature);
  writeFileSync(file, wireCapture(readFileSync(file, "utf8"), shot));
}

/** Where one of a shot's files goes, from the repository root. */
function outputPath(relative: string): string {
  return join(featuresDir, relative.replace(/^\.\//, ""));
}

async function take(shot: Shot, context: Context) {
  const files = captureFiles(shot);
  if ("image" in files) {
    const image =
      shot.id === "portal-branding/example-academy"
        ? await brandedCatalog(shot, context)
        : await screenshot(shot, context);
    const size = await writeWebp(image, outputPath(files.image));
    console.log(
      `captures: wrote ${files.image}, ${Math.round(size / 1024)} KB`,
    );
  } else {
    const { recordings, layout } = await recordLoop(shot, context);
    const size = await writeLoop(
      recordings,
      outputPath(files.video),
      outputPath(files.poster),
      layout,
    );
    console.log(
      `captures: wrote ${files.video}, ${Math.round(size / 1024)} KB`,
    );
  }
}

/** Sets a page's window for a shot, sharper for screenshots than for loops. */
async function setWindow(page: Page, shot: Shot, scale: number) {
  const viewport = shot.viewport ?? defaultViewport;
  await page.setViewport({ ...viewport, deviceScaleFactor: scale });
}

async function screenshot(shot: Shot, context: Context): Promise<Buffer> {
  const source = shot.source;
  if (!("terminal" in source)) return pageImage(shot, source, context);
  // A terminal over a page is narrower, so the page shows beside it.
  const script =
    "over" in source
      ? { ...source.terminal, size: { cols: 78, ...source.terminal.size } }
      : source.terminal;
  const cast = await terminalCast(script, context);
  if (!("over" in source)) return terminalImage(cast, script, context, true);
  const background = await pageImage(shot, source.over, context);
  const window = await terminalImage(cast, script, context, false);
  return overlay(background, window, Math.round(28 * screenshotScale));
}

/** The pages of Sessions shown side by side, started one after the other. */
async function sessionPages(
  names: readonly SessionName[],
  context: Context,
): Promise<Page[]> {
  const pages: Page[] = [];
  for (const name of names)
    pages.push(await context.capture.session(name, sessions[name]));
  return pages;
}

/**
 * The pages a source shows side by side, Sessions or pages of Example
 * Academy each in a browser of its own, or none for a source of one page.
 */
async function sideBySidePages(
  source: Source,
  context: Context,
): Promise<Page[] | undefined> {
  if ("sessions" in source) return sessionPages(source.sessions, context);
  if (!("sites" in source)) return undefined;
  const pages: Page[] = [];
  for (const path of source.sites)
    pages.push(await context.capture.sitePage(path, `site:${path}`));
  return pages;
}

/** A screenshot of a page in the browser, after the shot's setup. */
async function pageImage(
  shot: Shot,
  source: Source,
  context: Context,
): Promise<Buffer> {
  const pages = await sideBySidePages(source, context);
  if (pages) {
    await Promise.all(
      pages.map((page) => setWindow(page, shot, screenshotScale)),
    );
    for (const page of pages) await runSteps(page, shot.setup ?? [], fixtures);
    const [left, right] = await Promise.all(
      pages.map((page) => pageScreenshot(page, shot)),
    );
    return sideBySide(left!, right!, Math.round(4 * screenshotScale));
  }
  const page = await sourcePage(source, context, shot);
  await setWindow(page, shot, screenshotScale);
  await runSteps(page, shot.setup ?? [], fixtures);
  return pageScreenshot(page, shot);
}

async function pageScreenshot(page: Page, shot: Shot): Promise<Buffer> {
  await sleep(300);
  const data = await page.screenshot({
    type: "png",
    ...(shot.clip ? { clip: shot.clip } : {}),
  });
  return Buffer.from(data);
}

/** The page a source is shown in. */
async function sourcePage(
  source: Source,
  context: Context,
  shot: Shot,
): Promise<Page> {
  if ("session" in source)
    return context.capture.session(source.session, sessions[source.session]);
  if ("portal" in source) return context.capture.portalPage(source.portal);
  if ("site" in source) {
    // A loop starts a Session, and so does a shot whose setup presses a
    // button on the site, so each is a learner of its own.
    const startsSession =
      shot.kind === "loop" ||
      (shot.setup ?? []).some((step) => "press" in step);
    const learner = startsSession ? `${shot.kind}:${shot.id}` : "portal";
    return context.capture.sitePage(source.site, learner);
  }
  if ("url" in source) {
    const page = await context.capture.page("laptop-browser");
    // The workshop answers a few seconds after its container starts.
    await waitFor(
      async () =>
        (await page.goto(source.url, { waitUntil: "load" }))?.ok() ?? false,
      120_000,
      `the workshop at ${source.url} to answer`,
    );
    await waitFor(
      async () =>
        (await instructions(page)?.evaluate(
          () => document.querySelector(".page-content") !== null,
        )) ?? false,
      60_000,
      `the workshop at ${source.url}`,
    );
    await sleep(3000);
    return page;
  }
  throw new Error(`${shot.id}: no page to take it from`);
}

/** Records a terminal script, in the folder it runs in. */
async function terminalCast(
  script: TerminalScript,
  context: Context,
): Promise<Cast> {
  const first = script.commands[0]?.show ?? "";
  if (first.startsWith("educates serve-workshop")) {
    const cast = await serveWorkshop(script, context);
    await waitForCatalog(newWorkshop.title, context);
    return cast;
  }
  // The workshop in Docker answers on the port educates serve-workshop uses.
  if (first.startsWith("educates docker workshop deploy")) stopServing(context);
  const cast = await recordTerminal(script, terminalDir(script.cwd, context));
  if (first.startsWith("educates deploy-workshop"))
    await waitForCatalog(newWorkshop.title, context);
  return cast;
}

/**
 * Waits until the portal's catalog lists a workshop, restarting the portal
 * once if it has not within two minutes.
 */
async function waitForCatalog(title: string, context: Context) {
  for (const last of [false, true]) {
    const listed = await waitFor(
      async () => {
        const page = await context.capture.portalPage(
          "/workshops/catalog/",
          "catalog",
        );
        if (
          await page.evaluate(
            (text) => document.body.innerText.includes(text),
            title,
          )
        ) {
          return true;
        }
        await sleep(5000);
        return false;
      },
      last ? 300_000 : 120_000,
      `the portal to list ${title}`,
    )
      .then(() => true)
      .catch((error: Error) => {
        if (last) throw error;
        return false;
      });
    if (listed) return;
    console.warn(`captures: the portal does not list ${title}; restarting it`);
    restartPortal();
  }
}

function terminalDir(cwd: TerminalScript["cwd"], context: Context): string {
  if (cwd === "repository") return process.cwd();
  if (cwd === "scratch") return context.workshops;
  const dir = join(context.workshops, newWorkshop.name);
  if (!existsSync(dir)) {
    execFileSync(
      "educates",
      [
        "new-workshop",
        newWorkshop.name,
        "--title",
        newWorkshop.title,
        "--description",
        newWorkshop.description,
      ],
      { cwd: context.workshops },
    );
  }
  return dir;
}

/** A terminal window showing a cast at its end, on a backdrop or alone. */
async function terminalImage(
  cast: Cast,
  script: TerminalScript,
  context: Context,
  backdrop: boolean,
): Promise<Buffer> {
  const page = await context.capture.page("terminal");
  await page.setViewport({
    ...defaultViewport,
    deviceScaleFactor: screenshotScale,
  });
  await page.goto(
    terminalPageUrl(cast, script, context, { backdrop, play: false }),
    {
      waitUntil: "networkidle0",
    },
  );
  await page.evaluate(
    () => (window as unknown as { ready: Promise<void> }).ready,
  );
  await sleep(500);
  if (backdrop) return Buffer.from(await page.screenshot({ type: "png" }));
  const window = await page.$("#window");
  if (!window) throw new Error("the terminal page has no window");
  return Buffer.from(
    await window.screenshot({ type: "png", omitBackground: true }),
  );
}

function terminalPageUrl(
  cast: Cast,
  script: TerminalScript,
  context: Context,
  options: { backdrop: boolean; play: boolean },
): string {
  const castUrl = context.terminals.cast(`cast-${Date.now()}`, cast);
  const params = new URLSearchParams({
    cast: castUrl,
    title: script.title,
    cols: String(cast.width),
    rows: String(cast.height),
    font: String(terminalFontSize(cast.width)),
    at: String(castLength(cast) + 1),
    play: options.play ? "1" : "0",
    backdrop: options.backdrop ? "1" : "0",
  });
  return `${context.terminals.url}/?${params}`;
}

/**
 * Serves the new workshop's instructions from this machine with educates
 * serve-workshop, which keeps running until the captures finish or the
 * workshop moves to Docker, and returns the command with what it printed.
 */
async function serveWorkshop(
  script: TerminalScript,
  context: Context,
): Promise<Cast> {
  const command = script.commands[0]!.show;
  if (!context.serve) {
    const output: [number, string][] = [];
    const started = Date.now();
    const child = startInTerminal(command, terminalDir("workshop", context));
    child.stdout!.on("data", (chunk: Buffer) =>
      output.push([(Date.now() - started) / 1000, chunk.toString("utf8")]),
    );
    context.serve = { process: child, output };
    // The workshop restarts with sessions that proxy to this machine.
    await sleep(15_000);
  }
  const typed = typedCommand(script.title, command, 0.3);
  const events = [...typed.events];
  for (const [at, data] of context.serve.output)
    events.push([typed.enter + at, "o", data]);
  const cols = script.size?.cols ?? defaultTerminalSize.cols;
  return {
    width: cols,
    height: Math.max(6, screenRows(events, cols) + 1),
    events,
  };
}

function stopServing(context: Context) {
  if (!context.serve?.process.pid) return;
  try {
    process.kill(-context.serve.process.pid, "SIGINT");
  } catch {
    // Already stopped.
  }
  context.serve = undefined;
}

/** Removes the workshop educates docker workshop deploy started, if any. */
function removeDockerWorkshop(context: Context) {
  const dir = join(context.workshops, newWorkshop.name);
  if (!existsSync(dir)) return;
  try {
    execFileSync("educates", ["docker", "workshop", "delete"], {
      cwd: dir,
      stdio: "ignore",
    });
  } catch {
    // Not running.
  }
  // docker compose leaves the workshop's network behind.
  const networks = execFileSync(
    "docker",
    ["network", "ls", "--format", "{{.Name}}"],
    {
      encoding: "utf8",
    },
  )
    .split("\n")
    .filter(
      (name) =>
        name.includes(`--${newWorkshop.name}-`) && name.endsWith("_default"),
    );
  for (const network of networks) {
    execFileSync("docker", ["network", "rm", network], { stdio: "ignore" });
  }
}

/**
 * The catalog of a portal with Example Academy's title and logo. A portal
 * takes its title and logo when it is created, so the shot creates one of
 * its own, listing the capture workshops, and deletes it after.
 */
async function brandedCatalog(shot: Shot, context: Context): Promise<Buffer> {
  const logo = await sharp(Buffer.from(academyLogo)).png().toBuffer();
  const details = createBrandedPortal({
    title: "Example Academy",
    logo: `data:image/png;base64,${logo.toString("base64")}`,
  });
  try {
    const page = await context.capture.page("branded");
    await setWindow(page, shot, screenshotScale);
    await page.goto(`${details.url}/`, { waitUntil: "load" });
    if (page.url().includes("/workshops/access/")) {
      await page.type("#id_password", details.accessCode);
      await Promise.all([
        page.waitForNavigation({ waitUntil: "load" }),
        page.click("button[type=submit]"),
      ]);
    }
    await sleep(1500);
    return await pageScreenshot(page, shot);
  } finally {
    deleteBrandedPortal();
  }
}

/** Example Academy's logo: its initials on an amber tile. */
const academyLogo = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
<rect width="80" height="80" rx="16" fill="#f2a541"/>
<text x="40" y="53" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="#1f3a5f" text-anchor="middle">EA</text>
</svg>`;

async function recordLoop(
  shot: Shot,
  context: Context,
): Promise<{ recordings: Recording[]; layout: LoopLayout }> {
  const source = shot.source;
  const seconds = shot.seconds ?? 8;
  const dir = join(context.work, shot.id.replace("/", "-"));
  const pages = await sideBySidePages(source, context);
  if (pages) {
    await Promise.all(pages.map((page) => setWindow(page, shot, 1)));
    for (const page of pages) await runSteps(page, shot.setup ?? [], fixtures);
    const recordings = await record(pages, dir, seconds, async () => {
      await Promise.all(
        pages.map(async (page, index) => {
          await sleep(index * 700);
          await runSteps(page, shot.steps ?? [], fixtures, { front: false });
        }),
      );
    });
    return { recordings, layout: { kind: "row" } };
  }
  if ("terminal" in source) return liveUpdateLoop(shot, context, dir);
  const page = await sourcePage(source, context, shot);
  await setWindow(page, shot, 1);
  await runSteps(page, shot.setup ?? [], fixtures);
  const recordings = await record([page], dir, seconds, () =>
    runSteps(page, shot.steps ?? [], fixtures),
  );
  return { recordings, layout: { kind: "row" } };
}

/**
 * The local authoring loop: a Session of the new workshop, served from this
 * machine, refreshing when a terminal on this machine adds a line to the
 * instruction page it shows.
 */
async function liveUpdateLoop(
  shot: Shot,
  context: Context,
  dir: string,
): Promise<{ recordings: Recording[]; layout: LoopLayout }> {
  const script = (shot.source as { terminal: TerminalScript }).terminal;
  if (!context.serve) {
    await serveWorkshop(
      {
        ...script,
        commands: [
          {
            show: "educates serve-workshop --patch-workshop --portal site-captures",
          },
        ],
      },
      context,
    );
  }
  const page = await context.capture.session("laptop", sessions.laptop);
  await setWindow(page, shot, 1);
  await runSteps(page, [{ page: "00-workshop-overview" }], fixtures);
  const line =
    "You will deploy an application, and watch Kubernetes keep it running.";
  const edit = `echo "${line}" >> workshop/content/00-workshop-overview.md`;
  const typed = typedCommand(script.title, edit, 0.6);
  const events: Cast["events"] = [
    ...typed.events,
    [typed.enter + 0.2, "o", terminalPrompt(script.title)],
  ];
  const cast: Cast = { width: 78, height: screenRows(events, 78) + 1, events };
  const terminal = await context.capture.page("terminal-loop");
  await terminal.setViewport({ width: 960, height: 200, deviceScaleFactor: 1 });
  await terminal.goto(
    terminalPageUrl(cast, script, context, { backdrop: false, play: false }),
    {
      waitUntil: "networkidle0",
    },
  );
  await terminal.evaluate(() =>
    (window as unknown as { player: { seek(at: number): void } }).player.seek(
      0,
    ),
  );
  await sleep(500);
  const pageFile = join(
    terminalDir("workshop", context),
    "workshop/content/00-workshop-overview.md",
  );
  const recordings = await record(
    [page, terminal],
    dir,
    shot.seconds ?? 9,
    async () => {
      await terminal.evaluate(() =>
        (window as unknown as { player: { play(): void } }).player.play(),
      );
      await sleep(typed.enter * 1000);
      appendFileSync(pageFile, `\n${line}\n`);
      await waitFor(
        async () =>
          (await instructions(page)?.evaluate(
            (text) => document.body.innerText.includes(text),
            line,
          )) ?? false,
        8000,
        "the Session to show the change",
      ).catch((error: Error) => console.warn(`captures: ${error.message}`));
    },
  );
  const crop = await terminal.$eval("#window", (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  return { recordings, layout: { kind: "overlay", crop } };
}
