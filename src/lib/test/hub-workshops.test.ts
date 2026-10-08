import { describe, expect, it } from "vitest";
import { hubWorkshopLinks, type HubWorkshopLink } from "../hub-workshops.ts";

const links: HubWorkshopLink[] = [
  {
    id: "lab-kubernetes-fundamentals",
    title: "Kubernetes Fundamentals",
    url: "https://hub.educates.dev/lab-kubernetes-fundamentals/",
  },
  {
    id: "lab-lookup-installation",
    title: "Installing Educates Lookup Service",
    url: "https://hub.educates.dev/lab-lookup-installation/",
  },
];

describe("hubWorkshopLinks", () => {
  it("gives the title and Hub URL of each workshop a page names, in its order", () => {
    expect(
      hubWorkshopLinks(
        ["lab-lookup-installation", "lab-kubernetes-fundamentals"],
        links,
        "src/content/use-cases/demo-platform.md",
      ),
    ).toEqual([
      {
        id: "lab-lookup-installation",
        title: "Installing Educates Lookup Service",
        url: "https://hub.educates.dev/lab-lookup-installation/",
      },
      {
        id: "lab-kubernetes-fundamentals",
        title: "Kubernetes Fundamentals",
        url: "https://hub.educates.dev/lab-kubernetes-fundamentals/",
      },
    ]);
  });

  it("fails on an id the links file does not define, naming the id and who used it", () => {
    expect(() =>
      hubWorkshopLinks(
        ["lab-kubernetes-fundamentals", "lab-lookup-instalation"],
        links,
        "src/content/use-cases/demo-platform.md",
      ),
    ).toThrow(
      'src/content/use-cases/demo-platform.md names Hub workshop "lab-lookup-instalation", which src/content/hub-workshops.yml does not define',
    );
  });
});
