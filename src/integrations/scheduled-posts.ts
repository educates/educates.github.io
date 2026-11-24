import { fileURLToPath } from "node:url";
import { isSatteriProcessor, satteri } from "@astrojs/markdown-satteri";
import type { AstroIntegration } from "astro";
import { postDatings } from "../lib/post-dates.ts";
import {
  isPublished,
  publishDay,
  publishDayVariable,
  utcDay,
} from "../lib/post-schedule.ts";
import { unlinkPosts } from "../markdown/unlink-posts.ts";

/**
 * Sets up a build for the posts it leaves out, as src/lib/post-schedule.ts
 * says: it fixes the build's publish day in the environment, where
 * `posts()` reads it, and adds `unlinkPosts()` to the Markdown pipeline
 * with the posts the build leaves out, so a link to one from any page
 * renders as its plain text until a build publishes it. The dev server
 * shows every post and links to it.
 */
export function scheduledPosts(): AstroIntegration {
  return {
    name: "scheduled-posts",
    hooks: {
      "astro:config:setup": async ({
        command,
        config,
        updateConfig,
        logger,
      }) => {
        if (command !== "build") return;
        process.env[publishDayVariable] ||= utcDay(new Date());
        const day = publishDay(process.env);
        const left = (
          await postDatings(
            fileURLToPath(new URL("src/content/posts/", config.root)),
          )
        ).filter((post) => !isPublished(post, day));

        logger.info(
          day === undefined
            ? "Publishing posts of every date"
            : `Publishing the posts dated ${day} or before`,
        );
        if (left.length === 0) return;
        for (const post of left) {
          logger.info(
            `Leaving out ${post.slug} (${post.draft ? "draft" : utcDay(post.date)}), and unlinking links to it`,
          );
        }

        const processor = config.markdown.processor;
        if (!processor || !isSatteriProcessor(processor)) {
          throw new Error(
            "scheduled-posts adds its step to the Sätteri Markdown processor, and markdown.processor is not one",
          );
        }
        updateConfig({
          markdown: {
            processor: satteri({
              ...processor.options,
              hastPlugins: [
                ...processor.options.hastPlugins,
                unlinkPosts(new Set(left.map((post) => post.slug))),
              ],
            }),
          },
        });
      },
    },
  };
}
