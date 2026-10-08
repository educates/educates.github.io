// Terminals on the machine running the captures: runs commands under a
// pseudo-terminal, so they print as they would for a person, records their
// output as an asciicast, and renders it with asciinema-player in a page
// drawn like a terminal window.

import { spawn, type ChildProcess } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, resolve } from "node:path";
import type { TerminalScript } from "./manifest.ts";

/** An asciicast, version 2: a size and timed output events. */
export interface Cast {
  width: number;
  height: number;
  events: [number, "o", string][];
}

/** The terminal's width, and its most rows, unless a script asks for others. */
export const defaultTerminalSize = { cols: 100, rows: 34 };

/** The terminal's font size, in CSS pixels, at the default width or narrower. */
const defaultFontSize = 15;

/**
 * The font size of a terminal `cols` wide: the usual size up to the default
 * width, and smaller in proportion beyond it, so its window still fits the
 * capture window.
 */
export function terminalFontSize(cols: number): number {
  return Math.min(
    defaultFontSize,
    Math.floor((defaultFontSize * defaultTerminalSize.cols) / cols),
  );
}

/** How long typing one character of a command takes, in seconds. */
const keystroke = 0.03;

/** The prompt shown before each command. */
export function terminalPrompt(title: string): string {
  return `\u001b[1;36m${title}\u001b[0m \u001b[1;35m$\u001b[0m `;
}

/**
 * The events of a command typed after a prompt, from `at` seconds, and when
 * its Enter is pressed.
 */
export function typedCommand(
  title: string,
  command: string,
  at: number,
): { events: Cast["events"]; enter: number } {
  const events: Cast["events"] = [[at, "o", terminalPrompt(title)]];
  let clock = at + 0.4;
  for (const character of command) {
    events.push([clock, "o", character]);
    clock += keystroke;
  }
  clock += 0.3;
  events.push([clock, "o", "\r\n"]);
  return { events, enter: clock };
}

/**
 * Runs the script's commands one after the other in `cwd`, each shown after
 * a prompt as if typed, and records what they print.
 */
export async function recordTerminal(
  script: TerminalScript,
  cwd: string,
): Promise<Cast> {
  const size = {
    cols: script.size?.cols ?? defaultTerminalSize.cols,
    rows: script.size?.rows ?? defaultTerminalSize.rows,
  };
  const events: Cast["events"] = [];
  let clock = 0.3;
  for (const command of script.commands) {
    const typed = typedCommand(script.title, command.show, clock);
    events.push(...typed.events);
    const output = await runInTerminal(command.run ?? command.show, cwd, size);
    for (const [at, data] of output) events.push([typed.enter + at, "o", data]);
    clock = typed.enter + (output.at(-1)?.[0] ?? 0) + 0.5;
  }
  events.push([clock, "o", terminalPrompt(script.title)]);
  // Unless the script sets its rows, the window is as tall as its content.
  const rows =
    script.size?.rows ??
    Math.min(size.rows, Math.max(6, screenRows(events, size.cols) + 1));
  return { width: size.cols, height: rows, events };
}

/**
 * Starts a shell command under `script`, macOS's pseudo-terminal wrapper,
 * in a process group of its own, so it can be interrupted with everything
 * it started. What it prints is on its standard output.
 */
export function startInTerminal(
  command: string,
  cwd: string,
  size: { cols: number; rows: number } = defaultTerminalSize,
): ChildProcess {
  return spawn(
    "script",
    [
      "-q",
      "/dev/null",
      "/bin/sh",
      "-c",
      `stty cols ${size.cols} rows ${size.rows}; ${command}`,
    ],
    {
      cwd,
      env: { ...process.env, TERM: "xterm-256color" },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

/**
 * Runs a shell command in a pseudo-terminal, and returns what it printed,
 * with when, in seconds from its start.
 */
function runInTerminal(
  command: string,
  cwd: string,
  size: { cols: number; rows: number },
): Promise<[number, string][]> {
  return new Promise((resolvePromise, reject) => {
    const started = Date.now();
    const output: [number, string][] = [];
    const child = startInTerminal(command, cwd, size);
    child.stdout!.on("data", (chunk: Buffer) => {
      output.push([(Date.now() - started) / 1000, chunk.toString("utf8")]);
    });
    child.on("error", reject);
    child.on("close", () => resolvePromise(output));
  });
}

/**
 * How many rows of a terminal `cols` wide a cast's output fills, so its
 * window can be no taller than its content. Colors and other escape
 * sequences take no room; a carriage return goes back to the line's start.
 */
export function screenRows(events: Cast["events"], cols: number): number {
  const text = events
    .map(([, , data]) => data)
    .join("")
    .replace(/\u001b\[[0-9;?]*[A-Za-z]/g, "");
  return text
    .split("\n")
    .map((line) =>
      line
        .split("\r")
        .reduce((longest, part) => Math.max(longest, part.length), 0),
    )
    .reduce((rows, length) => rows + Math.max(1, Math.ceil(length / cols)), 0);
}

/** The asciicast as the file asciinema-player reads. */
export function castFile(cast: Cast): string {
  const header = JSON.stringify({
    version: 2,
    width: cast.width,
    height: cast.height,
  });
  return (
    [header, ...cast.events.map((event) => JSON.stringify(event))].join("\n") +
    "\n"
  );
}

/** When the last output of the cast arrives, in seconds. */
export function castLength(cast: Cast): number {
  return cast.events.at(-1)?.[0] ?? 0;
}

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
};

/**
 * Serves the terminal page, asciinema-player and the casts given to
 * `cast(name, cast)` on a local port.
 */
export async function terminalServer(): Promise<{
  url: string;
  cast(name: string, cast: Cast): string;
  close(): Promise<void>;
}> {
  const casts = new Map<string, string>();
  const player = resolve("node_modules/asciinema-player/dist/bundle");
  const page = resolve("scripts/captures/terminal.html");
  const server: Server = createServer((request, response) => {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    const cast = casts.get(path);
    if (cast !== undefined) {
      response.writeHead(200, { "Content-Type": "application/x-asciicast" });
      response.end(cast);
      return;
    }
    const file =
      path === "/" ? page : join(player, path.replace(/^\/player\//, ""));
    if (
      (file !== page && !file.startsWith(`${player}/`)) ||
      !existsSync(file)
    ) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const url = `http://127.0.0.1:${port}`;
  return {
    url,
    cast(name, cast) {
      casts.set(`/${name}.cast`, castFile(cast));
      return `${url}/${name}.cast`;
    },
    close: () => new Promise((done) => server.close(() => done())),
  };
}
