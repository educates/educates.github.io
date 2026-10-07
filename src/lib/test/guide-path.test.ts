import { describe, expect, it } from "vitest";
import { guidePath, type GuidePage } from "../guide-path.ts";

/** The guides' pages, out of order, as a collection may list them. */
const pages: GuidePage[] = [
  { id: "about", title: "What you just installed", order: 2 },
  { id: "setup/kubectl", title: "Installing kubectl", order: 2 },
  { id: "index", title: "Getting Started Guides", order: 0 },
  { id: "next-steps", title: "Next steps", order: 4 },
  { id: "authoring/basics", title: "Workshop basics", order: 1 },
  { id: "setup", title: "Set up", order: 1 },
  { id: "authoring", title: "Write your first workshop", order: 3 },
  { id: "setup/docker", title: "Installing Docker", order: 1 },
];

const base = "/getting-started-guides";

describe("guide path", () => {
  it("lists the parts numbered in order under the overview, each with its pages", () => {
    expect(guidePath(pages).sidebar).toEqual({
      label: "Getting Started Guides",
      href: base,
      items: [
        {
          marker: "1",
          label: "Set up",
          href: `${base}/setup`,
          items: [
            { label: "Installing Docker", href: `${base}/setup/docker` },
            { label: "Installing kubectl", href: `${base}/setup/kubectl` },
          ],
        },
        {
          marker: "2",
          label: "What you just installed",
          href: `${base}/about`,
        },
        {
          marker: "3",
          label: "Write your first workshop",
          href: `${base}/authoring`,
          items: [
            { label: "Workshop basics", href: `${base}/authoring/basics` },
          ],
        },
        { marker: "4", label: "Next steps", href: `${base}/next-steps` },
      ],
    });
  });

  it("leads from the overview through each part and its pages, then back again", () => {
    const path = guidePath(pages);
    const forward: string[] = [];
    let id: string | undefined = "index";
    while (id) {
      forward.push(id);
      id = path.around(id).next?.id;
    }
    expect(forward).toEqual([
      "index",
      "setup",
      "setup/docker",
      "setup/kubectl",
      "about",
      "authoring",
      "authoring/basics",
      "next-steps",
    ]);

    const backward: string[] = [];
    id = "next-steps";
    while (id) {
      backward.push(id);
      id = path.around(id).previous?.id;
    }
    expect(backward).toEqual([...forward].reverse());
  });

  it("links the previous and next pages by title", () => {
    expect(guidePath(pages).around("about")).toEqual({
      previous: {
        id: "setup/kubectl",
        label: "Installing kubectl",
        href: `${base}/setup/kubectl`,
      },
      next: {
        id: "authoring",
        label: "Write your first workshop",
        href: `${base}/authoring`,
      },
    });
  });

  it("names the part a page belongs to", () => {
    const path = guidePath(pages);
    expect(path.partOf("setup/kubectl")).toEqual({
      number: 1,
      count: 4,
      title: "Set up",
    });
    expect(path.partOf("authoring")).toEqual({
      number: 3,
      count: 4,
      title: "Write your first workshop",
    });
    expect(path.partOf("index")).toBeUndefined();
  });

  it("gives each page its URL path", () => {
    const path = guidePath(pages);
    expect(path.href("index")).toBe(base);
    expect(path.href("setup/docker")).toBe(`${base}/setup/docker`);
  });

  it("rejects a page outside any part, or nested deeper than a part", () => {
    expect(() =>
      guidePath([...pages, { id: "lost/page", title: "Lost", order: 1 }]),
    ).toThrow(/lost\/page/);
    expect(() =>
      guidePath([
        ...pages,
        { id: "setup/docker/desktop", title: "Too deep", order: 1 },
      ]),
    ).toThrow(/setup\/docker\/desktop/);
  });

  it("rejects a page it does not know", () => {
    expect(() => guidePath(pages).around("missing")).toThrow(/missing/);
  });
});
