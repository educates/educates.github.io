import { describe, expect, it } from "vitest";
import { wireCapture } from "../wire.ts";

const entry = `---
name: Lookup service
job: delivering
sentence: One REST API in front of many training portals and clusters, sending each request for a Session to where there is room.
flagship: true
order: 17
page:
  headline: Start Sessions from your own site, on one portal or many clusters
  covers: [portal-rest-api]
  loop:
    alt: A custom site lists workshops from the lookup service, and a click on one opens a new Session in the browser.
  things:
    - title: Your own front end on one portal
      text: Each training portal comes with a robot account for its REST API.
    - title: "People get their own Session back"
      text: Pass your own ID for each person with every request.
---

### From one training portal

Every training portal has a robot account.
`;

describe("wireCapture", () => {
  it("shows a screenshot on the Features overview, after the Feature's sentence", () => {
    const wired = wireCapture(entry, {
      id: "lookup-service/example-academy",
      feature: "lookup-service",
      slot: "visual",
      kind: "screenshot",
      alt: "Example Academy's own workshop list.",
    });

    expect(wired).toContain(
      [
        "sentence: One REST API in front of many training portals and clusters, sending each request for a Session to where there is room.",
        "visual:",
        "  src: ./lookup-service/example-academy.webp",
        "  alt: Example Academy's own workshop list.",
        "flagship: true",
      ].join("\n"),
    );
  });

  it("gives the deep page's loop its video and poster", () => {
    const wired = wireCapture(entry, {
      id: "lookup-service/start-a-session",
      feature: "lookup-service",
      slot: "loop",
      kind: "loop",
      alt: "Example Academy lists workshops, and a click on one opens a new Session.",
    });

    expect(wired).toContain(
      [
        "  loop:",
        "    alt: Example Academy lists workshops, and a click on one opens a new Session.",
        "    video: ./lookup-service/start-a-session.mp4",
        "    poster: ./lookup-service/start-a-session-poster.webp",
        "  things:",
      ].join("\n"),
    );
  });

  it("gives a thing its screenshot, after its text", () => {
    const wired = wireCapture(entry, {
      id: "lookup-service/same-session",
      feature: "lookup-service",
      slot: 1,
      kind: "screenshot",
      alt: "Two requests for the same learner return the same Session.",
    });

    expect(wired).toContain(
      [
        '    - title: "People get their own Session back"',
        "      text: Pass your own ID for each person with every request.",
        "      visual:",
        "        src: ./lookup-service/same-session.webp",
        "        alt: Two requests for the same learner return the same Session.",
        "---",
      ].join("\n"),
    );
  });

  it("leaves the rest of the entry as it was", () => {
    const wired = wireCapture(entry, {
      id: "lookup-service/same-session",
      feature: "lookup-service",
      slot: 1,
      kind: "screenshot",
      alt: "Two requests for the same learner return the same Session.",
    });

    const unwired = wired
      .split("\n")
      .filter((line) => !/^ {6}visual:$|^ {8}(src|alt): /.test(line))
      .join("\n");
    expect(unwired).toBe(entry);
  });

  it("replaces a capture wired before", () => {
    const shot = {
      id: "lookup-service/example-academy",
      feature: "lookup-service",
      slot: "visual" as const,
      kind: "screenshot" as const,
      alt: "Example Academy's own workshop list.",
    };
    const once = wireCapture(entry, shot);

    expect(
      wireCapture(once, { ...shot, alt: "Example Academy's workshops." }),
    ).toBe(
      once.replace(
        "alt: Example Academy's own workshop list.",
        "alt: Example Academy's workshops.",
      ),
    );
  });
});
