// What a Content cover shows: the "Product window" look, with the kind,
// the title and the mark on the left and, on the right, a window drawn like
// the Session dashboard and filled from the page or entry itself. The
// `Cover` component draws what `coverLayout()` returns, on a card and as an
// Open Graph image alike.

/** A blog post's cover: its window lists the post's own headings. */
export interface PostCover {
  form: "post";
  title: string;
  /** The post's slug, shown as `<slug>.md` in the window's bar. */
  slug: string;
  /** Its reading time in minutes. */
  minutes: number;
  date: Date;
  /** Shown in the window when the post has no headings. */
  description: string;
  /** The text of its `h2` headings, in order. */
  headings: string[];
}

/** A step of the Getting Started Guides' path, as its sidebar marks it. */
export interface GuideStep {
  /** What the step's circle shows, such as "2". */
  marker: string;
  label: string;
}

/**
 * A page of the Getting Started Guides that belongs to a part: its window
 * shows the path with the part filled.
 */
export interface GuideCover {
  form: "guide";
  title: string;
  /** The part's number on the path, from 1. */
  part: number;
  /** Every part of the path, in order. */
  steps: GuideStep[];
}

/**
 * A video or talk: its window plays the poster, or, for a video from
 * another channel, which has no poster, shows its event or channel.
 */
export interface VideoCover {
  form: "video";
  title: string;
  date: Date;
  /** Its length as written, such as "10:45". */
  length: string;
  /** The event or channel it comes from. */
  source: string;
  /**
   * The URL of its poster, only for a video from the project's own
   * channel: a URL path on a card, a data URI for an image renderer.
   */
  poster?: string;
  /** Whether it is a talk at an event rather than a video. */
  talk?: boolean;
}

/** An article on another site: its window is a browser at its address. */
export interface ArticleCover {
  form: "article";
  title: string;
  date: Date;
  /** Its URL without the scheme, as a browser's address bar shows it. */
  address: string;
  /** The site it is on, such as "grahamdumpleton.me". */
  source: string;
  author: string;
  description: string;
}

/**
 * Any other page of the site: its window lists the page's own headings, or
 * shows the Session pane when it has fewer than two.
 */
export interface PageCover {
  form: "page";
  title: string;
  /** The site section it belongs to, such as "Use case", shown as the kind. */
  section?: string;
  /** Its URL path, shown in the window's bar. */
  path: string;
  /** The text of its `h2` headings, in order. */
  headings: string[];
}

/**
 * A page whose window is always the Session pane, such as the homepage: an
 * instruction, a clickable `kubectl apply` and an examiner check.
 */
export interface SessionCover {
  form: "session";
  title: string;
  /** The site section it belongs to, shown as the kind. */
  section?: string;
}

export type CoverProps =
  PostCover | GuideCover | VideoCover | ArticleCover | PageCover | SessionCover;

/** The bar across the top of the window: a label and an optional detail. */
export interface CoverBar {
  label: string;
  detail?: string;
}

/** A heading in the window, drawn as a clickable action or numbered. */
export interface CoverRow {
  /** Its place, as two digits such as "02". */
  number: string;
  text: string;
  /** Whether it is drawn as a clickable action, as the first heading is. */
  action: boolean;
}

/** What fills the window on the right of the cover. */
export type CoverWindow =
  | { type: "contents"; bar: CoverBar; rows: CoverRow[] }
  | { type: "summary"; bar: CoverBar; text: string }
  | {
      type: "path";
      bar: CoverBar;
      steps: (GuideStep & { current: boolean })[];
    }
  | { type: "video"; bar: CoverBar; poster?: string; source?: string }
  | { type: "browser"; address: string; quote: string; byline: string }
  | { type: "session"; bar: CoverBar };

/** Everything the cover draws, decided from its props. */
export interface CoverLayout {
  /** The kind, above the title. */
  kind: string;
  /** Whether the kind carries the mark of a link that leaves the site. */
  external: boolean;
  title: string;
  /** The title's font size in pixels on the 1200 by 630 canvas. */
  titleSize: 66 | 58 | 50;
  /** A date or a source, after `educates.dev` at the bottom. */
  footnote?: string;
  window: CoverWindow;
}

/** How many headings the window lists at most. */
const ROWS = 4;

/** The kind of a page outside any section. */
const SITE_KIND = "educates.dev";

/** The Session pane, which shows the first step of a workshop's instructions. */
const SESSION: CoverWindow = {
  type: "session",
  bar: { label: "workshop instructions", detail: "1 / 4" },
};

/**
 * The title's font size in pixels on the 1200 by 630 canvas: 66, then 58
 * past 32 characters, then 50 past 52.
 */
export function titleSize(title: string): 66 | 58 | 50 {
  if (title.length <= 32) return 66;
  if (title.length <= 52) return 58;
  return 50;
}

/** A date as the cover writes it, such as "26 Feb 2026". */
export function coverDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** What the cover of `props` draws. */
export function coverLayout(props: CoverProps): CoverLayout {
  const common = {
    external: false,
    title: props.title,
    titleSize: titleSize(props.title),
  };
  switch (props.form) {
    case "post": {
      const bar = { label: `${props.slug}.md`, detail: `${props.minutes} min` };
      return {
        ...common,
        kind: "Blog post",
        footnote: coverDate(props.date),
        window:
          props.headings.length > 0
            ? { type: "contents", bar, rows: rows(props.headings) }
            : { type: "summary", bar, text: props.description },
      };
    }
    case "guide":
      return {
        ...common,
        kind: `Guide · Part ${props.part}`,
        window: {
          type: "path",
          bar: {
            label: "Getting Started Guides",
            detail: `${props.part} / ${props.steps.length}`,
          },
          steps: props.steps.map((step, index) => ({
            ...step,
            current: index + 1 === props.part,
          })),
        },
      };
    case "video": {
      const kind = props.talk ? "Talk" : "Video";
      const bar = { label: kind, detail: props.length };
      return {
        ...common,
        kind,
        footnote: coverDate(props.date),
        window: props.poster
          ? { type: "video", bar, poster: props.poster }
          : { type: "video", bar, source: props.source },
      };
    }
    case "article":
      return {
        ...common,
        kind: "Article",
        external: true,
        footnote: props.source,
        window: {
          type: "browser",
          address: props.address,
          quote: props.description,
          byline: `${props.author} · ${coverDate(props.date)}`,
        },
      };
    case "page":
      return {
        ...common,
        kind: props.section ?? SITE_KIND,
        window:
          props.headings.length >= 2
            ? {
                type: "contents",
                bar: { label: props.path },
                rows: rows(props.headings),
              }
            : SESSION,
      };
    case "session":
      return { ...common, kind: props.section ?? SITE_KIND, window: SESSION };
  }
}

function rows(headings: string[]): CoverRow[] {
  return headings.slice(0, ROWS).map((text, index) => ({
    number: String(index + 1).padStart(2, "0"),
    text,
    action: index === 0,
  }));
}
