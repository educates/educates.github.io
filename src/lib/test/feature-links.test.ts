import { describe, expect, it } from "vitest";
import { deepPageShowing, featureLinks } from "../features.ts";

const entries = [
  { id: "lookup-service", data: { name: "Lookup service", flagship: true } },
  { id: "portal-rest-api", data: { name: "Portal REST API", flagship: false } },
  { id: "ready-sessions", data: { name: "Ready Sessions", flagship: false } },
];

describe("featureLinks", () => {
  it("links a flagship Feature's deep page, and any other Feature's block on the overview", () => {
    expect(
      featureLinks(
        ["portal-rest-api", "lookup-service"],
        entries,
        "src/content/use-cases/demo-platform.md",
      ),
    ).toEqual([
      { name: "Portal REST API", href: "/features#portal-rest-api" },
      { name: "Lookup service", href: "/features/lookup-service" },
    ]);
  });

  it("fails on a Feature the site does not show, such as one that is 4.0-only", () => {
    expect(() =>
      featureLinks(
        ["ready-sessions", "air-gapped-install"],
        entries,
        "src/content/use-cases/team-training.md",
      ),
    ).toThrow(
      'src/content/use-cases/team-training.md names Feature "air-gapped-install", which the site does not show: it is missing from src/content/features/ or hidden until Educates 4.0 is released',
    );
  });
});

describe("deepPageShowing", () => {
  const withPages = [
    {
      id: "lookup-service",
      data: {
        name: "Lookup service",
        flagship: true,
        page: { covers: ["portal-rest-api"] },
      },
    },
    {
      id: "clickable-actions",
      data: { name: "Clickable actions", flagship: true },
    },
    {
      id: "portal-rest-api",
      data: { name: "Portal REST API", flagship: false },
    },
    {
      id: "ready-sessions",
      data: { name: "Ready Sessions", flagship: false },
    },
  ];

  it("gives a flagship Feature its own deep page", () => {
    expect(deepPageShowing("clickable-actions", withPages)).toEqual({
      id: "clickable-actions",
      name: "Clickable actions",
      href: "/features/clickable-actions",
    });
  });

  it("gives a Feature that a flagship's deep page covers that page", () => {
    expect(deepPageShowing("portal-rest-api", withPages)).toEqual({
      id: "lookup-service",
      name: "Lookup service",
      href: "/features/lookup-service",
    });
  });

  it("gives any other Feature no deep page", () => {
    expect(deepPageShowing("ready-sessions", withPages)).toBeUndefined();
  });
});
