// The URL check: requests every entry of the site check's must-resolve list
// from a served copy of the site, such as the live site after a deploy, and
// reports what does not resolve. Pages and files must answer 200; redirect
// sources must be redirect pages that land on their targets.
//
// Usage: node scripts/url-check/cli.ts <base-url>
//
// For example `npm run url-check -- https://educates.dev`, or
// `npm run url-check -- http://localhost:8080` against the Docker image's
// `serve` target. Exits 1 when any entry does not resolve.

import { loadSiteUrls } from "../site-check/site-urls.ts";
import { checkServedUrls } from "./url-check.ts";

const baseUrl = process.argv[2];
if (!baseUrl || !URL.canParse(baseUrl)) {
  console.error("Usage: node scripts/url-check/cli.ts <base-url>");
  process.exit(1);
}

const { entries, redirects } = loadSiteUrls();
const results = await checkServedUrls({ baseUrl, entries, redirects });

const failed = results.filter((result) => !result.ok);
const lines = [
  `URL check of ${baseUrl}: ${results.length - failed.length} of ${results.length} URLs resolve`,
];
for (const section of [...new Set(failed.map((result) => result.section))]) {
  lines.push("", `${section}:`);
  for (const result of failed.filter((each) => each.section === section)) {
    lines.push(`  ${result.path} ${result.message}`);
  }
}
console.log(lines.join("\n"));
process.exitCode = failed.length > 0 ? 1 : 0;
