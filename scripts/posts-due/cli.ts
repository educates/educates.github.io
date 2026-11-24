// Prints the slug of each post that goes out on a day, today in UTC unless
// one is named: the posts dated that day, drafts aside, which a build that
// day publishes and a build the day before left out. The Publish scheduled
// posts workflow deploys the site when it prints any.
// Usage: npm run posts-due [-- <YYYY-MM-DD> [<posts folder>]]

import { resolve } from "node:path";
import { postDatings } from "../../src/lib/post-dates.ts";
import { goesOutOn, isDay, utcDay } from "../../src/lib/post-schedule.ts";

const day = process.argv[2] ?? utcDay(new Date());
const dir = resolve(process.argv[3] ?? "src/content/posts");

if (!isDay(day)) {
  console.error(`posts-due: "${day}" is not a day as YYYY-MM-DD`);
  process.exitCode = 1;
} else {
  for (const post of await postDatings(dir)) {
    if (goesOutOn(post, day)) console.log(post.slug);
  }
}
