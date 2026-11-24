import type { HastPluginDefinition } from "satteri";

/**
 * A link to a post's page, `/blog/<slug>` as `postPath()` in
 * src/lib/posts.ts writes it, with or without a query or an `#anchor`.
 */
const postLink = /^\/blog\/([^/?#]+)(?:[?#].*)?$/;

/**
 * Turns each link to a post in `slugs`, the posts the build leaves out,
 * into its plain text: the link's content stays where it was, without the
 * `<a>`. A build that publishes the post links to it again.
 */
export function unlinkPosts(slugs: ReadonlySet<string>): HastPluginDefinition {
  return {
    name: "unlink-posts",
    element: {
      filter: ["a"],
      visit(link, ctx) {
        const href = link.properties.href;
        if (typeof href !== "string") return;
        const slug = postLink.exec(href)?.[1];
        if (slug !== undefined && slugs.has(slug)) {
          ctx.replaceNode(link, link.children);
        }
      },
    },
  };
}
