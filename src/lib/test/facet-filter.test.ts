import { describe, expect, it } from "vitest";
import {
  facetGroupsInUse,
  pickFacet,
  selectionFromQuery,
  selectionToQuery,
  visibleEntries,
  type FacetedEntry,
  type FacetGroup,
  type FacetSelection,
} from "../facet-filter.ts";

// The Learn page's two groups, kind and Topic, as data.
const entries: FacetedEntry[] = [
  { id: "kind-post", facets: { kind: ["posts"], topic: ["working-locally"] } },
  { id: "ai-post", facets: { kind: ["posts"], topic: ["ai"] } },
  {
    id: "install-video",
    facets: { kind: ["videos"], topic: ["installing-and-running"] },
  },
  { id: "ai-talk", facets: { kind: ["videos"], topic: ["ai", "news"] } },
  { id: "setup-guide", facets: { kind: ["guides"], topic: [] } },
];

const ids = (list: FacetedEntry[]) => list.map((entry) => entry.id);

describe("visibleEntries", () => {
  it("shows every entry, in order, when nothing is selected", () => {
    expect(ids(visibleEntries(entries, {}))).toEqual([
      "kind-post",
      "ai-post",
      "install-video",
      "ai-talk",
      "setup-guide",
    ]);
  });

  it("shows the entries with the one value selected in a group", () => {
    expect(ids(visibleEntries(entries, { kind: "videos" }))).toEqual([
      "install-video",
      "ai-talk",
    ]);
    expect(ids(visibleEntries(entries, { topic: "ai" }))).toEqual([
      "ai-post",
      "ai-talk",
    ]);
  });

  it("combines groups: an entry shows only with the value selected in each", () => {
    expect(
      ids(visibleEntries(entries, { kind: "videos", topic: "ai" })),
    ).toEqual(["ai-talk"]);
    expect(
      ids(visibleEntries(entries, { kind: "guides", topic: "ai" })),
    ).toEqual([]);
  });
});

describe("pickFacet", () => {
  it("keeps one value per group: picking another value replaces the first", () => {
    expect(pickFacet({ kind: "posts" }, "kind", "videos")).toEqual({
      kind: "videos",
    });
  });

  it("leaves the other groups as they were", () => {
    expect(pickFacet({ kind: "posts" }, "topic", "ai")).toEqual({
      kind: "posts",
      topic: "ai",
    });
  });

  it("clears a group when its selected value is picked again", () => {
    expect(pickFacet({ kind: "posts", topic: "ai" }, "kind", "posts")).toEqual({
      topic: "ai",
    });
  });

  it("clears a group when no value is picked, as an All chip does", () => {
    expect(
      pickFacet({ kind: "posts", topic: "ai" }, "topic", undefined),
    ).toEqual({ kind: "posts" });
  });
});

const groups: FacetGroup[] = [
  {
    id: "kind",
    label: "Kind",
    values: [
      { id: "posts", label: "Blog posts" },
      { id: "guides", label: "Guides" },
      { id: "videos", label: "Videos and talks" },
    ],
  },
  {
    id: "topic",
    label: "Topic",
    values: [
      { id: "ai", label: "AI" },
      { id: "news", label: "News" },
    ],
  },
];

describe("the selection in the query string", () => {
  it("writes the selected value of each group, in the groups' order", () => {
    expect(selectionToQuery({ topic: "ai", kind: "videos" }, groups)).toBe(
      "?kind=videos&topic=ai",
    );
  });

  it("round-trips: the query reads back as the same selection", () => {
    const selections: FacetSelection[] = [
      {},
      { kind: "guides" },
      { kind: "posts", topic: "news" },
    ];
    for (const selection of selections) {
      expect(
        selectionFromQuery(selectionToQuery(selection, groups), groups),
      ).toEqual(selection);
    }
  });

  it("writes nothing for an empty selection", () => {
    expect(selectionToQuery({}, groups)).toBe("");
  });

  it("keeps the query's other parameters", () => {
    expect(
      selectionToQuery({ kind: "posts" }, groups, "?topic=ai&utm_source=slack"),
    ).toBe("?utm_source=slack&kind=posts");
    expect(selectionToQuery({}, groups, "?kind=posts&utm_source=slack")).toBe(
      "?utm_source=slack",
    );
  });

  it("reads an empty query as no selection, which shows every entry", () => {
    for (const query of ["", "?", "?kind=&topic="]) {
      const selection = selectionFromQuery(query, groups);
      expect(selection).toEqual({});
      expect(visibleEntries(entries, selection)).toHaveLength(entries.length);
    }
  });

  it("ignores a parameter that names no group, and a value its group does not have", () => {
    expect(
      selectionFromQuery("?colour=blue&kind=podcasts&topic=ai", groups),
    ).toEqual({ topic: "ai" });
    expect(selectionFromQuery("?Kind=posts&topic=AI", groups)).toEqual({});
  });

  it("keeps one value per group from a query that repeats it: the first known one", () => {
    expect(
      selectionFromQuery("?kind=podcasts&kind=guides&kind=posts", groups),
    ).toEqual({ kind: "guides" });
  });
});

describe("facetGroupsInUse", () => {
  it("leaves out each value no entry has, and keeps the others in order", () => {
    expect(facetGroupsInUse(groups, entries)).toEqual([
      {
        id: "kind",
        label: "Kind",
        values: [
          { id: "posts", label: "Blog posts" },
          { id: "guides", label: "Guides" },
          { id: "videos", label: "Videos and talks" },
        ],
      },
      {
        id: "topic",
        label: "Topic",
        values: [
          { id: "ai", label: "AI" },
          { id: "news", label: "News" },
        ],
      },
    ]);
    expect(facetGroupsInUse(groups, entries.slice(0, 3))).toEqual([
      {
        id: "kind",
        label: "Kind",
        values: [
          { id: "posts", label: "Blog posts" },
          { id: "videos", label: "Videos and talks" },
        ],
      },
      { id: "topic", label: "Topic", values: [{ id: "ai", label: "AI" }] },
    ]);
  });

  it("leaves out a group none of whose values any entry has", () => {
    expect(facetGroupsInUse(groups, [entries[4]])).toEqual([
      {
        id: "kind",
        label: "Kind",
        values: [{ id: "guides", label: "Guides" }],
      },
    ]);
  });
});

describe("a facet set other than kind and Topic", () => {
  // A catalog of workshops, filtered by type and level.
  const catalog: FacetGroup[] = [
    {
      id: "type",
      label: "Type",
      values: [
        { id: "workshop", label: "Workshop" },
        { id: "extension", label: "Extension package" },
      ],
    },
    {
      id: "level",
      label: "Level",
      values: [
        { id: "beginner", label: "Beginner" },
        { id: "advanced", label: "Advanced" },
      ],
    },
  ];
  const workshops: FacetedEntry[] = [
    { id: "fundamentals", facets: { type: ["workshop"], level: ["beginner"] } },
    { id: "operators", facets: { type: ["workshop"], level: ["advanced"] } },
    { id: "vscode", facets: { type: ["extension"], level: ["beginner"] } },
  ];

  it("filters by its own groups, read from and written to the query string", () => {
    const selection = selectionFromQuery(
      "?type=workshop&level=beginner&kind=posts",
      catalog,
    );
    expect(selection).toEqual({ type: "workshop", level: "beginner" });
    expect(ids(visibleEntries(workshops, selection))).toEqual(["fundamentals"]);
    expect(
      selectionToQuery(pickFacet(selection, "level", "beginner"), catalog),
    ).toBe("?type=workshop");
  });
});
