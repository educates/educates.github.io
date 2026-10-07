// Reads the RSS 2.0 and Atom feeds the `feed` library writes, with regular
// expressions over the markup, as the sitemap rule reads `<loc>`. Each
// item's HTML is in a CDATA section, set aside before any element is
// matched, so markup inside a post never reads as part of the feed.

/** An RSS `<item>`, as written. */
export interface RssItem {
  link?: string;
  guid?: string;
  /** The `isPermaLink` attribute of the `<guid>`, when it has one. */
  isPermaLink?: string;
  /** The item's HTML, from `<content:encoded>`. */
  content?: string;
}

/** An Atom `<entry>`, as written. */
export interface AtomEntry {
  id?: string;
  /** The `href` of its alternate `<link>`. */
  link?: string;
  /** The entry's HTML, from `<content type="html">`. */
  content?: string;
}

/** The items of an RSS feed, in order. */
export function rssItems(xml: string): RssItem[] {
  const { markup, cdata } = setAsideCdata(xml);
  return [...markup.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const guid = /<guid(\s[^>]*)?>([^<]*)<\/guid>/.exec(item);
    return {
      link: text(/<link>([^<]*)<\/link>/.exec(item)?.[1]),
      guid: text(guid?.[2]),
      isPermaLink: text(attribute(guid?.[1], "isPermaLink")),
      content: cdata(
        /<content:encoded>([^<]*)<\/content:encoded>/.exec(item)?.[1],
      ),
    };
  });
}

/** An Atom feed's own `<id>` and its entries, in order. */
export function atomFeed(xml: string): { id?: string; entries: AtomEntry[] } {
  const { markup, cdata } = setAsideCdata(xml);
  const head = markup.split("<entry>")[0];
  const entries = [...markup.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(
    ([, entry]) => {
      const alternate = [...entry.matchAll(/<link(\s[^>]*?)\/?>/g)]
        .map(([, attributes]) => attributes)
        .find((attributes) =>
          [undefined, "alternate"].includes(attribute(attributes, "rel")),
        );
      return {
        id: text(/<id>([^<]*)<\/id>/.exec(entry)?.[1]),
        link: text(attribute(alternate, "href")),
        content: cdata(
          /<content type="html">([^<]*)<\/content>/.exec(entry)?.[1],
        ),
      };
    },
  );
  return { id: text(/<id>([^<]*)<\/id>/.exec(head)?.[1]), entries };
}

/**
 * The feed's markup with each CDATA section replaced by a numbered marker,
 * and a function that returns the section a marker stands for.
 */
function setAsideCdata(xml: string): {
  markup: string;
  cdata: (marker: string | undefined) => string | undefined;
} {
  const sections: string[] = [];
  const markup = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, section) => {
    sections.push(section);
    return `\u0000${sections.length - 1}\u0000`;
  });
  return {
    markup,
    cdata(marker) {
      const match = /^\s*\u0000(\d+)\u0000\s*$/.exec(marker ?? "");
      return match ? sections[Number(match[1])] : undefined;
    },
  };
}

function attribute(
  attributes: string | undefined,
  name: string,
): string | undefined {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(attributes ?? "")?.[1];
}

/** XML character data with its entities decoded and its spacing trimmed. */
function text(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value
    .trim()
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
