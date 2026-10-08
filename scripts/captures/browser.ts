// Drives Chrome against the capture portal: opens Sessions as anonymous
// learners, works through the capture workshop's instructions, and takes
// pages of the portal and of Example Academy.
//
// The cluster's ingress certificate comes from a local certificate
// authority, so this browser, and only this browser, accepts certificates
// it cannot verify.

import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import puppeteer, { type Browser, type Frame, type Page } from "puppeteer-core";
import type { SessionName, Step } from "./manifest.ts";

/** Chrome on macOS, unless `CHROME_PATH` names another. */
export const chromePath =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** The window most shots are taken in, in CSS pixels. */
export const defaultViewport = { width: 1152, height: 720 };

/** How much sharper than CSS pixels screenshots are. */
export const screenshotScale = 2;

export interface Portal {
  url: string;
  accessCode: string;
}

/** Where shots of the cluster are taken: the capture portal and Example Academy. */
export interface Targets {
  portal: Portal;
  siteUrl: string;
}

export class Capture {
  readonly #browser: Browser;
  readonly #findTargets: () => Targets;
  #targets: Targets | undefined;
  readonly #pages = new Map<string, Page>();

  private constructor(browser: Browser, findTargets: () => Targets) {
    this.#browser = browser;
    this.#findTargets = findTargets;
  }

  /**
   * Starts the browser. `findTargets` is asked for the portal and Example
   * Academy the first time a shot needs them, so shots that need neither,
   * such as a terminal's, run without the capture portal.
   */
  static async launch(findTargets: () => Targets): Promise<Capture> {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      acceptInsecureCerts: true,
      defaultViewport: { ...defaultViewport, deviceScaleFactor: 1 },
      args: ["--hide-scrollbars", "--force-color-profile=srgb"],
    });
    return new Capture(browser, findTargets);
  }

  get #portal(): Portal {
    this.#targets ??= this.#findTargets();
    return this.#targets.portal;
  }

  get #siteUrl(): string {
    this.#targets ??= this.#findTargets();
    return this.#targets.siteUrl;
  }

  async close() {
    await this.#browser.close();
  }

  /**
   * The page of a browser context of its own, created the first time it is
   * asked for, so each name is a different anonymous learner.
   */
  async page(name: string): Promise<Page> {
    const existing = this.#pages.get(name);
    if (existing) return existing;
    const context = await this.#browser.createBrowserContext();
    const page = await context.newPage();
    const cdp = await page.createCDPSession();
    await cdp.send("Browser.setDownloadBehavior", { behavior: "deny" });
    this.#pages.set(name, page);
    return page;
  }

  /** Signs a page's learner in to the portal, past its access code. */
  async signIn(page: Page) {
    await page.goto(`${this.#portal.url}/`, { waitUntil: "load" });
    if (page.url().includes("/workshops/access/")) {
      await page.type("#id_password", this.#portal.accessCode);
      await Promise.all([
        page.waitForNavigation({ waitUntil: "load" }),
        page.click("button[type=submit]"),
      ]);
    }
  }

  /** A page of the portal, for a learner signed in past its access code. */
  async portalPage(path: string, name = "portal"): Promise<Page> {
    const page = await this.page(name);
    // The portal restarts for a minute or two after its workshops change.
    await waitFor(
      async () => {
        if (!page.url().startsWith(this.#portal.url)) await this.signIn(page);
        const response = await page.goto(`${this.#portal.url}${path}`, {
          waitUntil: "load",
        });
        return (
          (response?.status() ?? 500) < 500 &&
          !page.url().includes("/workshops/access/")
        );
      },
      300_000,
      `the portal page ${path}`,
    );
    return page;
  }

  /** A page of Example Academy, for a learner signed in to the portal. */
  async sitePage(path: string, name = "portal"): Promise<Page> {
    const page = await this.page(name);
    if (page.url() === "about:blank") await this.signIn(page);
    await page.goto(`${this.#siteUrl}${path}`, { waitUntil: "load" });
    return page;
  }

  /**
   * A Session of the workshop the portal lists as `title`, started the
   * first time `name` is asked for, with its dashboard open.
   */
  async session(name: SessionName, title: string): Promise<Page> {
    const known = this.#pages.has(name);
    const page = await this.page(name);
    if (known) return page;
    // The portal restarts for a minute or two after its workshops change,
    // so the catalog is read until it lists the workshop.
    const findStart = async () => {
      if (!page.url().includes("/workshops/catalog/")) await this.signIn(page);
      await page.goto(`${this.#portal.url}/workshops/catalog/`, {
        waitUntil: "load",
      });
      const start = await page.evaluateHandle((workshop) => {
        const cards = [...document.querySelectorAll(".card")];
        const card = cards.find(
          (element) =>
            element
              .querySelector(".card-title, h5, h4")
              ?.textContent?.trim() === workshop,
        );
        return (
          card?.querySelector<HTMLElement>("a.start-workshop, a.btn") ?? null
        );
      }, title);
      return start.asElement();
    };
    let link = await findStart().catch(() => null);
    const deadline = Date.now() + 600_000;
    while (!link && Date.now() < deadline) {
      await sleep(5000);
      link = await findStart().catch(() => null);
    }
    if (!link)
      throw new Error(`the portal lists no workshop titled "${title}"`);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "load", timeout: 300_000 }),
      (link as unknown as { click(): Promise<void> }).click(),
    ]);
    let attempts = 1;
    await waitFor(
      async () => {
        // A Session deleted as it was handed out sends the learner back to
        // the catalog, so the workshop is started again.
        if (page.url().includes("/workshops/catalog/") && attempts < 3) {
          attempts += 1;
          const again = await findStart();
          if (again) {
            await Promise.all([
              page.waitForNavigation({ waitUntil: "load", timeout: 300_000 }),
              (again as unknown as { click(): Promise<void> }).click(),
            ]);
          }
          return false;
        }
        // The dashboard, or the instructions in it, can fail to load while
        // a new Session starts.
        const session = page
          .frames()
          .find((candidate) => candidate.name() === "session");
        if (session?.url().startsWith("chrome-error:")) {
          await page.reload({ waitUntil: "load" });
          return false;
        }
        const frame = instructions(page);
        if (!frame) return false;
        if (frame.url().startsWith("chrome-error:")) {
          await frame.goto(
            new URL("/workshop/content/", dashboard(page).url()).href,
          );
          return false;
        }
        return frame.evaluate(
          () => document.querySelector(".page-content") !== null,
        );
      },
      600_000,
      `the dashboard of the ${name} Session`,
    ).catch(async (error: Error) => {
      const screenshot = join(tmpdir(), `captures-${name}-session.png`);
      await page
        .screenshot({ path: screenshot as `${string}.png` })
        .catch(() => undefined);
      throw new Error(`${error.message} (at ${page.url()}, see ${screenshot})`);
    });
    // Gives the terminals time to connect.
    await sleep(4000);
    return page;
  }
}

/** Polls `check` until it is true, or fails after `timeoutMs`. */
export async function waitFor(
  check: () => Promise<boolean>,
  timeoutMs: number,
  what: string,
) {
  const deadline = Date.now() + timeoutMs;
  while (!(await check().catch(() => false))) {
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
    await sleep(500);
  }
}

/** The frame of the Session's dashboard, inside the portal's page. */
export function dashboard(page: Page): Frame {
  // A frame's name is fixed when the frame is created, and the portal
  // creates the Session's frame before it names it, so its URL tells too.
  return (
    page
      .frames()
      .find(
        (frame) =>
          frame.name() === "session" ||
          new URL(frame.url()).pathname === "/dashboard/",
      ) ?? page.mainFrame()
  );
}

/** The frame of the workshop instructions. */
export function instructions(page: Page): Frame | undefined {
  return page
    .frames()
    .find(
      (frame) =>
        frame.name() === "workshop-iframe" ||
        frame.url().includes("/workshop/content/"),
    );
}

function requireInstructions(page: Page): Frame {
  const frame = instructions(page);
  if (!frame) throw new Error("the page has no workshop instructions");
  return frame;
}

/** Runs the steps of a shot on a page, in order. */
export async function runSteps(
  page: Page,
  steps: readonly Step[],
  fixtures: string,
  options: { front?: boolean } = {},
) {
  // Chrome holds back pages in the background, so the page comes first,
  // unless two pages are being recorded side by side.
  if (steps.length > 0 && options.front !== false) await page.bringToFront();
  for (const step of steps) await runStep(page, step, fixtures);
}

async function runStep(page: Page, step: Step, fixtures: string) {
  if ("page" in step) {
    // The dashboard can still be redirecting its instructions to the first
    // page, or replace their frame, so the frame is looked up on each try.
    // A frame that failed to load shows Chrome's error page, so the page's
    // URL comes from the Session's own dashboard.
    const path = `/workshop/content/${step.page}/`;
    const url = new URL(path, dashboard(page).url()).href;
    // A page that stays blank is loaded again.
    let loaded = 0;
    await waitFor(
      async () => {
        const frame = requireInstructions(page);
        if (frame.url() !== url || Date.now() - loaded > 10_000) {
          loaded = Date.now();
          await frame.goto(url, { waitUntil: "load" });
          return false;
        }
        return frame.evaluate(
          () => document.querySelector(".page-content") !== null,
        );
      },
      60_000,
      `page ${step.page}`,
    ).catch(async (error: Error) => {
      const screenshot = join(tmpdir(), `captures-page-${step.page}.png`);
      await page
        .screenshot({ path: screenshot as `${string}.png` })
        .catch(() => undefined);
      const frames = page
        .frames()
        .map((frame) => `${frame.name() || "-"} ${frame.url()}`);
      throw new Error(
        `${error.message}, expected ${url}; frames: ${frames.join(", ")}; see ${screenshot}`,
      );
    });
    await sleep(1200);
  } else if ("click" in step) {
    await clickAction(page, step.click, step.wait ?? 30_000);
  } else if ("fill" in step) {
    const field = `#clickable-action-${step.fill} [name="${step.field}"]`;
    const frame = requireInstructions(page);
    await frame.click(field, { count: 3 });
    await frame.type(field, step.value, { delay: 60 });
  } else if ("submit" in step) {
    await clickAction(
      page,
      step.submit,
      30_000,
      `#clickable-action-${step.submit} [type=submit]`,
    );
  } else if ("upload" in step) {
    const frame = requireInstructions(page);
    const input = await frame.$(
      `#clickable-action-${step.upload} input[type=file]`,
    );
    if (!input) throw new Error(`action ${step.upload} has no file to upload`);
    await (
      input as unknown as { uploadFile(path: string): Promise<void> }
    ).uploadFile(`${fixtures}/${step.file}`);
    await clickAction(
      page,
      step.upload,
      30_000,
      `#clickable-action-${step.upload} button, #clickable-action-${step.upload} [type=submit]`,
    );
  } else if ("tab" in step) {
    await openTab(page, step.tab);
  } else if ("console" in step) {
    const frame = page
      .frames()
      .find((candidate) => candidate.url().includes("://console-"));
    if (!frame) throw new Error("the Session has no console open");
    const url = new URL(frame.url());
    const namespace =
      url.hash.match(/namespace=([^&]+)/)?.[1] ??
      url.hostname.split(".")[0]!.replace(/^console-/, "");
    await frame.goto(`${url.origin}/#/${step.console}?namespace=${namespace}`, {
      waitUntil: "load",
    });
  } else if ("press" in step) {
    await page.click(step.press);
  } else if ("text" in step) {
    await waitFor(
      async () => {
        if (
          await page.evaluate(
            (text) => document.body.innerText.includes(text),
            step.text,
          )
        ) {
          return true;
        }
        await sleep(5000);
        await page.reload({ waitUntil: "load" });
        return false;
      },
      600_000,
      `the page to show "${step.text}"`,
    );
  } else if ("hover" in step) {
    await dashboard(page).hover(step.hover);
    await sleep(600);
  } else if ("pause" in step) {
    await sleep(step.pause);
  } else if ("scroll" in step) {
    const frame = requireInstructions(page);
    if (step.scroll === "top") {
      await frame.evaluate(() => {
        for (const element of [
          document.scrollingElement,
          ...document.querySelectorAll("*"),
        ]) {
          if (element && element.scrollTop > 0) element.scrollTop = 0;
        }
      });
    } else {
      await frame.$eval(`#clickable-action-${step.scroll}`, (element) =>
        element.scrollIntoView({ block: "start" }),
      );
    }
    await sleep(400);
  }
}

/** Brings a dashboard tab to the front, by its label. */
async function openTab(page: Page, label: string) {
  const clicked = await dashboard(page).evaluate((wanted) => {
    const tab = [
      ...document.querySelectorAll<HTMLElement>("a[id$='-tab'], [role=tab]"),
    ].find((element) => element.textContent?.trim() === wanted);
    tab?.click();
    return tab !== undefined;
  }, label);
  if (!clicked) throw new Error(`the dashboard has no ${label} tab`);
  await sleep(800);
}

/**
 * Clicks clickable action `number` (or `target` inside it), and waits for
 * it to finish, for up to `waitMs`. A wait of 0 does not wait.
 */
async function clickAction(
  page: Page,
  number: number,
  waitMs: number,
  target?: string,
) {
  const frame = requireInstructions(page);
  const selector = `#clickable-action-${number}`;
  const before = await frame.$eval(
    selector,
    (element) => (element as HTMLElement).dataset.actionCompleted ?? "",
  );
  await frame.$eval(selector, (element) =>
    element.scrollIntoView({ block: "nearest" }),
  );
  await sleep(250);
  await frame.click(target ?? `${selector} .clickable-action__header`);
  if (waitMs === 0) {
    await sleep(400);
    return;
  }
  await waitFor(
    () =>
      frame.$eval(
        selector,
        (element, previous) => {
          const data = (element as HTMLElement).dataset;
          return (
            (data.actionResult === "success" ||
              data.actionResult === "failure") &&
            (data.actionCompleted ?? "") !== previous
          );
        },
        before,
      ),
    waitMs,
    `action ${number} to finish`,
  ).catch((error: Error) =>
    console.warn(`captures: ${error.message}; carrying on`),
  );
  await sleep(600);
}
