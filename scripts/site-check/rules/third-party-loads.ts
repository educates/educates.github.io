import { parse, type HTMLElement } from "node-html-parser";
import { atomFeed, rssItems } from "../feed-xml.ts";
import type { Finding, Rule } from "../site-check.ts";
import { urlPathOf } from "../url-form.ts";

export interface ThirdPartyLoadsOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
  /** Other origins a page may load from, such as GoatCounter's script host. */
  allowedOrigins: string[];
  /** The URL paths of the RSS and Atom feeds, such as `/blog/rss.xml`. */
  feeds: string[];
}

/** A URL a piece of HTML loads, and what loads it, such as `<img src>`. */
interface Load {
  url: string;
  by: string;
}

/** The attributes that load a resource, by element. */
const loadingAttributes: Readonly<Record<string, readonly string[]>> = {
  img: ["src", "srcset"],
  source: ["src", "srcset"],
  script: ["src"],
  iframe: ["src"],
  video: ["src", "poster"],
  audio: ["src"],
  track: ["src"],
  embed: ["src"],
  object: ["data"],
};

/** The `<link>` relations that load what `href` names. */
const loadingRelations = ["stylesheet", "preload", "modulepreload", "manifest"];

/**
 * No page or feed item loads anything from another site: every picture,
 * script, frame, video, sound, stylesheet, icon and CSS `url()` comes from
 * the site itself, or from an allowed origin. A request to another site
 * hands it the visitor's address and lets it set cookies. Links are not
 * loads: a visitor follows them by choice.
 */
export function thirdPartyLoads({
  origin,
  allowedOrigins,
  feeds,
}: ThirdPartyLoadsOptions): Rule {
  const thirdParty = (url: string): boolean => {
    if (!/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(url)) return false;
    let parsed: URL;
    try {
      parsed = new URL(url, origin);
    } catch {
      return false;
    }
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.origin !== origin &&
      !allowedOrigins.includes(parsed.origin)
    );
  };
  const outsideLoads = (html: HTMLElement): Load[] =>
    loadsIn(html).filter((load) => thirdParty(load.url));

  return {
    name: "third-party-loads",
    check(build) {
      const findings: Finding[] = [];
      for (const file of build.pages()) {
        for (const { url, by } of outsideLoads(build.html(file))) {
          findings.push({
            rule: "third-party-loads",
            severity: "error",
            message: `${urlPathOf(file)} (${file}) loads ${url} from another site, in ${by}`,
          });
        }
      }
      for (const feed of feeds) {
        const file = build.resolve(feed);
        if (file === undefined) continue;
        const xml = build.read(file);
        const items = /<rss[\s>]/.test(xml)
          ? rssItems(xml)
          : atomFeed(xml).entries;
        for (const { link, content } of items) {
          for (const { url, by } of outsideLoads(parse(content ?? ""))) {
            findings.push({
              rule: "third-party-loads",
              severity: "error",
              message: `${file}: the item for ${link} loads ${url} from another site, in ${by}`,
            });
          }
        }
      }
      return findings;
    },
  };
}

/** Every URL a piece of parsed HTML loads, in document order. */
function loadsIn(html: HTMLElement): Load[] {
  const loads: Load[] = [];
  for (const element of html.querySelectorAll("*")) {
    const tag = element.rawTagName.toLowerCase();
    for (const name of loadingAttributes[tag] ?? []) {
      const value = element.getAttribute(name);
      if (value === undefined) continue;
      const urls = name === "srcset" ? srcsetUrls(value) : [value.trim()];
      for (const url of urls) loads.push({ url, by: `<${tag} ${name}>` });
    }
    if (tag === "link") {
      const href = element.getAttribute("href");
      const relations = (element.getAttribute("rel") ?? "")
        .toLowerCase()
        .split(/\s+/)
        .filter(
          (relation) =>
            loadingRelations.includes(relation) || relation.endsWith("icon"),
        );
      if (href !== undefined && relations.length > 0) {
        loads.push({ url: href.trim(), by: `<link rel="${relations[0]}">` });
      }
    }
    if (tag === "style") {
      for (const url of cssUrls(element.rawText)) {
        loads.push({ url, by: "<style>" });
      }
    }
    const style = element.getAttribute("style");
    if (style !== undefined) {
      for (const url of cssUrls(style)) {
        loads.push({ url, by: "a style attribute" });
      }
    }
  }
  return loads;
}

/** The URL of each candidate of a `srcset`. */
function srcsetUrls(srcset: string): string[] {
  return srcset
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter((url) => url !== undefined && url !== "");
}

/** The URL of each CSS `url()` in a stylesheet or a style attribute. */
function cssUrls(css: string): string[] {
  return [...css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)].map(([, , url]) =>
    url.trim(),
  );
}
