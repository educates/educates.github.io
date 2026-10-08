// Takes the screenshots and recordings on the Features pages from a running
// Educates. Usage:
//
//   npm run captures -- setup            deploy the capture workshop and its portal
//   npm run captures [-- <shot id>...]   take every shot, or only those named
//   npm run captures -- list             list the shots
//   npm run captures -- check            check the manifest against the entries
//   npm run captures -- teardown         remove everything setup created
//
// See scripts/captures/README.md.

import { setup, teardown } from "./cluster.ts";

const [command, ...rest] = process.argv.slice(2);

try {
  if (command === "setup") setup();
  else if (command === "teardown") teardown();
  else {
    const { main } = await import("./run.ts");
    await main(command === undefined ? [] : [command, ...rest]);
  }
} catch (error) {
  console.error(`captures: ${(error as Error).message}`);
  process.exitCode = 1;
}
