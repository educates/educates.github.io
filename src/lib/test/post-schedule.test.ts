import { describe, expect, it } from "vitest";
import {
  goesOutOn,
  isDay,
  isPublished,
  publishDay,
  utcDay,
} from "../post-schedule.ts";

/** A post dated `day`, as the schema coerces `date: <day>`. */
function post(day: string, draft = false) {
  return { date: new Date(day), draft };
}

describe("utcDay", () => {
  it("names the UTC day, whatever the hour", () => {
    expect(utcDay(new Date("2026-11-25"))).toBe("2026-11-25");
    expect(utcDay(new Date("2026-11-25T23:59:59Z"))).toBe("2026-11-25");
    expect(utcDay(new Date("2026-11-25T23:30:00-02:00"))).toBe("2026-11-26");
  });
});

describe("publishDay", () => {
  const now = new Date("2026-11-24T06:17:00Z");

  it("is the UTC day of now when nothing is set", () => {
    expect(publishDay({}, now)).toBe("2026-11-24");
    expect(publishDay({ PUBLISH_DAY: "" }, now)).toBe("2026-11-24");
  });

  it("is the day PUBLISH_DAY names", () => {
    expect(publishDay({ PUBLISH_DAY: "2026-11-26" }, now)).toBe("2026-11-26");
  });

  it("is undefined when the build includes future posts", () => {
    expect(publishDay({ INCLUDE_FUTURE_POSTS: "true" }, now)).toBeUndefined();
    expect(
      publishDay(
        { INCLUDE_FUTURE_POSTS: "true", PUBLISH_DAY: "2026-11-26" },
        now,
      ),
    ).toBeUndefined();
    expect(publishDay({ INCLUDE_FUTURE_POSTS: "false" }, now)).toBe(
      "2026-11-24",
    );
  });

  it("throws on a value it cannot read", () => {
    expect(() => publishDay({ INCLUDE_FUTURE_POSTS: "1" }, now)).toThrow(
      /INCLUDE_FUTURE_POSTS/,
    );
    expect(() => publishDay({ PUBLISH_DAY: "2026-11-31" }, now)).toThrow(
      /PUBLISH_DAY/,
    );
    expect(() => publishDay({ PUBLISH_DAY: "tomorrow" }, now)).toThrow(
      /PUBLISH_DAY/,
    );
  });
});

describe("isDay", () => {
  it("accepts a calendar day as YYYY-MM-DD only", () => {
    expect(isDay("2026-11-24")).toBe(true);
    expect(isDay("2028-02-29")).toBe(true);
    expect(isDay("2026-02-29")).toBe(false);
    expect(isDay("2026-11-24T00:00:00Z")).toBe(false);
    expect(isDay("26-11-24")).toBe(false);
  });
});

describe("isPublished", () => {
  it("publishes a post dated the publish day or before", () => {
    expect(isPublished(post("2026-11-23"), "2026-11-24")).toBe(true);
    expect(isPublished(post("2026-11-24"), "2026-11-24")).toBe(true);
    expect(isPublished(post("2026-11-25"), "2026-11-24")).toBe(false);
  });

  it("compares the post's date in UTC", () => {
    expect(
      isPublished(
        { date: new Date("2026-11-24T23:59:59Z"), draft: false },
        "2026-11-24",
      ),
    ).toBe(true);
    expect(
      isPublished(
        { date: new Date("2026-11-25T00:00:00Z"), draft: false },
        "2026-11-24",
      ),
    ).toBe(false);
  });

  it("publishes every post but drafts with no publish day", () => {
    expect(isPublished(post("2099-01-01"), undefined)).toBe(true);
    expect(isPublished(post("2026-11-23", true), undefined)).toBe(false);
  });

  it("never publishes a draft", () => {
    expect(isPublished(post("2026-11-23", true), "2026-11-24")).toBe(false);
  });
});

describe("goesOutOn", () => {
  it("is true for a post dated the day, drafts aside", () => {
    expect(goesOutOn(post("2026-11-24"), "2026-11-24")).toBe(true);
    expect(goesOutOn(post("2026-11-23"), "2026-11-24")).toBe(false);
    expect(goesOutOn(post("2026-11-25"), "2026-11-24")).toBe(false);
    expect(goesOutOn(post("2026-11-24", true), "2026-11-24")).toBe(false);
  });
});
