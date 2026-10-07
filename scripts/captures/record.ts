// Records pages through the DevTools screencast: Chrome sends a frame each
// time a page repaints, with when it painted it, and the frames become a
// video in media.ts.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import type { Page } from "puppeteer-core";
import type { Frame } from "./frames.ts";
import type { Recording } from "./media.ts";

/**
 * Records `pages` while `act` runs, for `seconds` in all, and returns a
 * recording of each, its frames saved in a folder under `dir`.
 */
export async function record(
  pages: readonly Page[],
  dir: string,
  seconds: number,
  act: () => Promise<void>,
): Promise<Recording[]> {
  const casts = await Promise.all(
    pages.map(async (page, index) => {
      const folder = join(dir, `screencast-${index}`);
      mkdirSync(folder, { recursive: true });
      const frames: Frame[] = [];
      const cdp = await page.createCDPSession();
      cdp.on("Page.screencastFrame", (event) => {
        const file = join(
          folder,
          `frame-${String(frames.length).padStart(5, "0")}.jpg`,
        );
        writeFileSync(file, Buffer.from(event.data, "base64"));
        frames.push({
          file,
          timestamp: event.metadata.timestamp ?? Date.now() / 1000,
        });
        cdp
          .send("Page.screencastFrameAck", { sessionId: event.sessionId })
          .catch(() => undefined);
      });
      await cdp.send("Page.startScreencast", {
        format: "jpeg",
        quality: 92,
        everyNthFrame: 1,
      });
      return { cdp, frames, folder };
    }),
  );
  // The first frames arrive as the screencast starts.
  await sleep(500);
  const start = Date.now() / 1000;
  await act();
  const remaining = start + seconds - Date.now() / 1000;
  if (remaining > 0) await sleep(remaining * 1000);
  const end = start + seconds;
  await sleep(300);
  await Promise.all(
    casts.map(({ cdp }) =>
      cdp.send("Page.stopScreencast").catch(() => undefined),
    ),
  );
  return casts.map(({ frames, folder }) => ({
    dir: folder,
    frames,
    start,
    end,
  }));
}
