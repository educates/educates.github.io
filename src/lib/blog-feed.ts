// The blog's RSS and Atom feeds, /blog/rss.xml and /blog/atom.xml, from one
// definition and the `feed` library. Feed readers know each item by its
// post URL (docs/adr/0002-keep-the-docusaurus-url-form.md), so items get a
// `link` and no `id`: the library then writes the link as the RSS `guid`,
// marked isPermaLink="true", and as the Atom entry `id`. The site check's
// feed-identity rule fails the build if that ever changes.

import { Feed } from "feed";
import { site } from "../site.ts";
import { blogDescription } from "./blog-pages.ts";
import { postFeedHtml } from "./post-feed-html.ts";
import { blogPath, postAuthors, postPath, postTags, posts } from "./posts.ts";

export type FeedFormat = "rss" | "atom";

/** How many of the newest posts the feeds carry. */
export const feedSize = 20;

/** The URL path of each feed. */
export const feedPaths: Record<FeedFormat, string> = {
  rss: `${blogPath}/rss.xml`,
  atom: `${blogPath}/atom.xml`,
};

/** The URL path of the XSL stylesheet a browser shows each feed with. */
const stylesheetPaths: Record<FeedFormat, string> = {
  rss: `${blogPath}/rss.xsl`,
  atom: `${blogPath}/atom.xsl`,
};

/** The blog feed in `format`, with the newest posts in full, as XML. */
export async function blogFeed(format: FeedFormat): Promise<string> {
  const newest = (await posts()).slice(0, feedSize);
  const blogUrl = `${site.origin}${blogPath}`;
  const feed = new Feed({
    // The title feed readers already show for the blog.
    title: "Educates Training Platform Blog",
    description: blogDescription,
    id: blogUrl,
    link: blogUrl,
    language: "en",
    favicon: `${site.origin}/img/favicon.ico`,
    // The newest post's date, so a build without a new post changes nothing.
    updated: newest[0]?.data.date,
    feedLinks: {
      rss: `${site.origin}${feedPaths.rss}`,
      atom: `${site.origin}${feedPaths.atom}`,
    },
    stylesheet: stylesheetPaths[format],
  });
  for (const post of newest) {
    const link = `${site.origin}${postPath(post)}`;
    feed.addItem({
      title: post.data.title,
      link,
      date: post.data.date,
      description: post.data.description,
      content: await postFeedHtml(post, link),
      // An RSS 2.0 author is an email address, which authors here do not
      // publish, so only Atom entries name their authors.
      author:
        format === "atom"
          ? (await postAuthors(post)).map((author) => ({
              name: author.data.name,
              link: author.data.url,
            }))
          : undefined,
      category: (await postTags(post)).map((tag) => ({
        name: tag.data.label,
        term: tag.data.label,
      })),
    });
  }
  return format === "rss" ? feed.rss2() : feed.atom1();
}
