import { atomFeed, rssItems } from "../feed-xml.ts";
import {
  isRedirectPage,
  type Build,
  type Finding,
  type Rule,
} from "../site-check.ts";
import { urlFormProblem } from "../url-form.ts";

export interface FeedIdentityOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
  /** The blog's URL path, `/blog`, under which both feeds and posts live. */
  blogPath: string;
}

/**
 * The blog feeds keep the identity feed readers know them by
 * (docs/adr/0002-keep-the-docusaurus-url-form.md): every RSS `guid` and
 * Atom entry `id` is its post's URL, `<origin>/blog/<slug>`, equal to the
 * item's link and served by the build as a page; every `guid` is marked
 * `isPermaLink="true"`; and the Atom feed's own `id` is `<origin>/blog`.
 * A feed reader shows an item whose identity changes as a new post. A feed
 * missing from the build is the must-resolve list's to report.
 */
export function feedIdentity({ origin, blogPath }: FeedIdentityOptions): Rule {
  const blogUrl = `${origin}${blogPath}`;
  const postPath = new RegExp(`^${escapeRegExp(blogPath)}/[^/]+$`);

  return {
    name: "feed-identity",
    check(build) {
      const findings: Finding[] = [];
      const fail = (file: string, message: string) =>
        findings.push({
          rule: "feed-identity",
          severity: "error",
          message: `${file}: ${message}`,
        });

      /** What is wrong with an item's identity, or `undefined` if nothing. */
      const identityProblem = (
        kind: string,
        identity: string | undefined,
        link: string | undefined,
      ): string | undefined => {
        if (identity === undefined) {
          return `the item linking ${link} has no ${kind}; it must be its post URL`;
        }
        if (identity !== link) {
          return `${kind} ${identity} is not its link ${link}`;
        }
        const formProblem = urlFormProblem(identity, origin);
        if (formProblem) return `${kind} ${identity} ${formProblem}`;
        const { pathname } = new URL(identity);
        if (!postPath.test(pathname)) {
          return `${kind} ${identity} is not ${blogUrl}/<slug>`;
        }
        if (!servesPage(build, pathname)) {
          return `${kind} ${identity} is not served by the build as a page`;
        }
        return undefined;
      };

      const rssFile = `${blogPath.slice(1)}/rss.xml`;
      if (build.files.has(rssFile)) {
        for (const item of rssItems(build.read(rssFile))) {
          const problem = identityProblem("guid", item.guid, item.link);
          if (problem) fail(rssFile, problem);
          if (item.guid !== undefined && item.isPermaLink !== "true") {
            fail(rssFile, `guid ${item.guid} is not marked isPermaLink="true"`);
          }
        }
      }

      const atomFile = `${blogPath.slice(1)}/atom.xml`;
      if (build.files.has(atomFile)) {
        const feed = atomFeed(build.read(atomFile));
        if (feed.id !== blogUrl) {
          fail(atomFile, `feed id ${feed.id} is not ${blogUrl}`);
        }
        for (const entry of feed.entries) {
          const problem = identityProblem("id", entry.id, entry.link);
          if (problem) fail(atomFile, problem);
        }
      }
      return findings;
    },
  };
}

function servesPage(build: Build, urlPath: string): boolean {
  const file = build.resolve(urlPath);
  return (
    file !== undefined &&
    file.endsWith(".html") &&
    !isRedirectPage(build.html(file))
  );
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
