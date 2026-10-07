import { describe, expect, it } from "vitest";
import {
  coverLayout,
  titleSize,
  type ArticleCover,
  type GuideCover,
  type PageCover,
  type PostCover,
  type SessionCover,
  type VideoCover,
} from "../cover.ts";

const title = (length: number) => "x".repeat(length);

const post: PostCover = {
  form: "post",
  title: "Reviewing workshops with AI",
  slug: "reviewing-workshops-with-ai",
  minutes: 6,
  date: new Date("2026-02-26"),
  description:
    "Having the Claude browser extension review an Educates workshop as a real user would.",
  headings: [
    "Reviewing the source vs the experience",
    "Claude in the browser",
    "Navigating the workshop",
    "The impartial reviewer",
    "Wrapping up",
  ],
};

describe("coverLayout for a part of the Getting Started Guides", () => {
  const guide: GuideCover = {
    form: "guide",
    title: "What you just installed",
    part: 2,
    steps: [
      { marker: "1", label: "Set up" },
      { marker: "2", label: "What you just installed" },
      { marker: "3", label: "Write your first workshop" },
      { marker: "4", label: "Next steps" },
    ],
  };

  it("names the part as the kind, with no date", () => {
    const layout = coverLayout(guide);
    expect(layout).toMatchObject({
      kind: "Guide · Part 2",
      title: "What you just installed",
      titleSize: 66,
    });
    expect(layout.footnote).toBeUndefined();
  });

  it("shows the numbered path with its own step filled", () => {
    expect(coverLayout(guide).window).toEqual({
      type: "path",
      bar: { label: "Getting Started Guides", detail: "2 / 4" },
      steps: [
        { marker: "1", label: "Set up", current: false },
        { marker: "2", label: "What you just installed", current: true },
        { marker: "3", label: "Write your first workshop", current: false },
        { marker: "4", label: "Next steps", current: false },
      ],
    });
  });
});

describe("coverLayout for a video", () => {
  const video: VideoCover = {
    form: "video",
    title: "Install Educates on Google Cloud using the Command Line Interface",
    date: new Date("2025-05-02"),
    length: "10:45",
    source: "EducatesTrainingPlatform",
    poster: "/_astro/C6vCd6Nhf5M.webp",
  };

  it("names the kind, sizes the title and dates it", () => {
    expect(coverLayout(video)).toMatchObject({
      kind: "Video",
      external: false,
      titleSize: 50,
      footnote: "2 May 2025",
    });
  });

  it("plays its poster under a bar with its length", () => {
    expect(coverLayout(video).window).toEqual({
      type: "video",
      bar: { label: "Video", detail: "10:45" },
      poster: "/_astro/C6vCd6Nhf5M.webp",
    });
  });

  it("shows the event or channel in place of a poster, for a video from another channel", () => {
    const talk: VideoCover = {
      ...video,
      title: "Interactive workshops on Kubernetes",
      talk: true,
      source: "KubeCon Europe 2025",
      poster: undefined,
    };
    expect(coverLayout(talk)).toMatchObject({
      kind: "Talk",
      window: {
        type: "video",
        bar: { label: "Talk", detail: "10:45" },
        source: "KubeCon Europe 2025",
      },
    });
  });
});

describe("coverLayout for an outside article", () => {
  const article: ArticleCover = {
    form: "article",
    title: "Developer Advocacy in 2026",
    date: new Date("2026-02-01"),
    address: "grahamdumpleton.me/posts/2026/02/developer-advocacy-in-2026",
    source: "grahamdumpleton.me",
    author: "Graham Dumpleton",
    description:
      "What are the major forces that have reshaped developer advocacy.",
  };

  it("marks the kind as leaving the site and names the site it is on", () => {
    expect(coverLayout(article)).toMatchObject({
      kind: "Article",
      external: true,
      footnote: "grahamdumpleton.me",
    });
  });

  it("shows its address in a browser bar, its description as a quote, and its author and date", () => {
    expect(coverLayout(article).window).toEqual({
      type: "browser",
      address: "grahamdumpleton.me/posts/2026/02/developer-advocacy-in-2026",
      quote: "What are the major forces that have reshaped developer advocacy.",
      byline: "Graham Dumpleton · 1 Feb 2026",
    });
  });
});

describe("coverLayout for any other page", () => {
  const page: PageCover = {
    form: "page",
    title: "Hands-on events",
    section: "Use case",
    path: "/use-cases/hands-on-events",
    headings: ["Before the event", "On the day", "Afterwards"],
  };
  const session = {
    type: "session",
    bar: { label: "workshop instructions", detail: "1 / 4" },
  };

  it("lists its own headings under its path, with its section as the kind", () => {
    expect(coverLayout(page)).toMatchObject({
      kind: "Use case",
      external: false,
      title: "Hands-on events",
      window: {
        type: "contents",
        bar: { label: "/use-cases/hands-on-events" },
        rows: [
          { number: "01", text: "Before the event", action: true },
          { number: "02", text: "On the day", action: false },
          { number: "03", text: "Afterwards", action: false },
        ],
      },
    });
    expect(coverLayout(page).footnote).toBeUndefined();
  });

  it("names the site as the kind when the page has no section", () => {
    expect(coverLayout({ ...page, section: undefined }).kind).toBe(
      "educates.dev",
    );
  });

  it("shows the Session pane when the page has fewer than two headings", () => {
    expect(
      coverLayout({ ...page, headings: ["Before the event"] }),
    ).toMatchObject({ kind: "Use case", window: session });
    expect(coverLayout({ ...page, headings: [] }).window).toEqual(session);
  });

  it("shows the Session pane on a page that asks for it, whatever its headings", () => {
    const home: SessionCover = {
      form: "session",
      title: "Hands-on workshops and demos, ready in one click",
    };
    expect(coverLayout(home)).toMatchObject({
      kind: "educates.dev",
      titleSize: 58,
      window: session,
    });
  });
});

describe("coverLayout for a blog post", () => {
  it("names the kind, sizes the title and dates it", () => {
    expect(coverLayout(post)).toMatchObject({
      kind: "Blog post",
      external: false,
      title: "Reviewing workshops with AI",
      titleSize: 66,
      footnote: "26 Feb 2026",
    });
  });

  it("lists its first four headings under its file name and reading time, the first as a clickable action", () => {
    expect(coverLayout(post).window).toEqual({
      type: "contents",
      bar: { label: "reviewing-workshops-with-ai.md", detail: "6 min" },
      rows: [
        {
          number: "01",
          text: "Reviewing the source vs the experience",
          action: true,
        },
        { number: "02", text: "Claude in the browser", action: false },
        { number: "03", text: "Navigating the workshop", action: false },
        { number: "04", text: "The impartial reviewer", action: false },
      ],
    });
  });

  it("shows its description when it has no headings", () => {
    expect(coverLayout({ ...post, headings: [] }).window).toEqual({
      type: "summary",
      bar: { label: "reviewing-workshops-with-ai.md", detail: "6 min" },
      text: "Having the Claude browser extension review an Educates workshop as a real user would.",
    });
  });
});

describe("titleSize", () => {
  it("steps the title down from 66 to 58 to 50 px as it passes 32 and 52 characters", () => {
    expect(titleSize(title(12))).toBe(66);
    expect(titleSize(title(32))).toBe(66);
    expect(titleSize(title(33))).toBe(58);
    expect(titleSize(title(52))).toBe(58);
    expect(titleSize(title(53))).toBe(50);
    expect(titleSize(title(120))).toBe(50);
  });
});
