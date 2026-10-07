import { describe, expect, it } from "vitest";
import {
  contentFacets,
  featuredEntries,
  learnFacetGroups,
  learnOrder,
  relatedEntries,
  topicsOf,
  type ContentEntry,
  type Topic,
} from "../content-entries.ts";

const topics: Topic[] = [
  {
    id: "authoring-workshops",
    label: "Authoring workshops",
    tags: ["authoring", "workshops", "python"],
  },
  {
    id: "installing-and-running",
    label: "Installing and running",
    tags: ["installation", "kubernetes", "getting-started", "cli"],
  },
  {
    id: "working-locally",
    label: "Working locally",
    tags: ["local", "kind", "cli"],
  },
  { id: "ai", label: "AI", tags: ["ai"] },
];

describe("topicsOf", () => {
  it("gives the Topics that group any of the tags, in the Topics' order", () => {
    expect(
      topicsOf(["educates", "kind", "workshops"], topics).map(
        (topic) => topic.id,
      ),
    ).toEqual(["authoring-workshops", "working-locally"]);
  });

  it("counts a tag in two Topics for both", () => {
    expect(topicsOf(["cli"], topics).map((topic) => topic.id)).toEqual([
      "installing-and-running",
      "working-locally",
    ]);
  });

  it("gives none for tags no Topic groups", () => {
    expect(topicsOf(["educates", "tips-and-tricks"], topics)).toEqual([]);
  });
});

/** A Content entry with only what these tests read. */
function entry(id: string, fields: Partial<ContentEntry> = {}): ContentEntry {
  return {
    id,
    kind: "posts",
    label: "Blog post",
    href: `/${id}`,
    title: id,
    description: `About ${id}.`,
    topics: [],
    cover: { form: "session", title: id },
    ...fields,
  };
}

const day = (date: string) => new Date(`${date}T00:00:00Z`);
const ids = (list: ContentEntry[]) => list.map((item) => item.id);

describe("learnOrder", () => {
  it("lists the newest first, then the undated guides in their own order", () => {
    expect(
      ids(
        learnOrder([
          entry("guides/setup", { kind: "guides" }),
          entry("posts/older", { date: day("2024-10-13") }),
          entry("guides/authoring", { kind: "guides" }),
          entry("outside-content/talk", {
            kind: "videos",
            date: day("2025-05-02"),
          }),
          entry("posts/newer", { date: day("2026-02-26") }),
        ]),
      ),
    ).toEqual([
      "posts/newer",
      "outside-content/talk",
      "posts/older",
      "guides/setup",
      "guides/authoring",
    ]);
  });
});

const list = [
  entry("posts/ai", { topics: [topics[3]] }),
  entry("posts/kind", { topics: [topics[2]] }),
  entry("posts/cli", { topics: [topics[1], topics[2]] }),
  entry("guides/setup", { kind: "guides", topics: [topics[1], topics[2]] }),
  entry("posts/news"),
];

describe("featuredEntries", () => {
  it("gives the entries the Featured list names, in its order", () => {
    expect(
      ids(featuredEntries(["guides/setup", "posts/ai", "posts/kind"], list)),
    ).toEqual(["guides/setup", "posts/ai", "posts/kind"]);
  });

  it("fails on an id that names no Content entry", () => {
    expect(() => featuredEntries(["posts/ai", "posts/gone"], list)).toThrow(
      'Featured Content names "posts/gone", which is no Content entry',
    );
  });
});

describe("relatedEntries", () => {
  it("gives up to three other entries sharing a Topic, in the list's order", () => {
    expect(ids(relatedEntries(list[2], list))).toEqual([
      "posts/kind",
      "guides/setup",
    ]);
    expect(ids(relatedEntries(list[1], list, 1))).toEqual(["posts/cli"]);
  });

  it("gives none for an entry with no Topic", () => {
    expect(relatedEntries(list[4], list)).toEqual([]);
  });
});

describe("the Learn page's facets", () => {
  it("are kind and Topic, as data, with every kind and Topic in order", () => {
    expect(learnFacetGroups(topics.slice(2))).toEqual([
      {
        id: "kind",
        label: "Kind",
        values: [
          { id: "posts", label: "Blog posts" },
          { id: "guides", label: "Guides" },
          { id: "videos", label: "Videos and talks" },
          { id: "articles", label: "Articles" },
        ],
      },
      {
        id: "topic",
        label: "Topic",
        values: [
          { id: "working-locally", label: "Working locally" },
          { id: "ai", label: "AI" },
        ],
      },
    ]);
  });

  it("give each entry its kind and its Topics", () => {
    expect(contentFacets(list[3])).toEqual({
      id: "guides/setup",
      facets: {
        kind: ["guides"],
        topic: ["installing-and-running", "working-locally"],
      },
    });
  });
});
