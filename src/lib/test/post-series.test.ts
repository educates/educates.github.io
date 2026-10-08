import { describe, expect, it } from "vitest";
import { seriesOf, type SeriesPost } from "../post-series.ts";

const cloud = "Installing Educates on a cloud provider";

/** Published posts, newest first, as the blog lists them. */
const posts: SeriesPost[] = [
  {
    id: "deploying-yourself",
    title: "Deploying Educates yourself",
    href: "/blog/deploying-yourself",
  },
  {
    id: "verify-cloud-install",
    href: "/blog/verify-cloud-install",
    title: "Installing Educates on a cloud provider (Part 2 - Verification)",
    series: cloud,
    part: 2,
  },
  {
    id: "install-cloud-cli",
    href: "/blog/install-cloud-cli",
    title: "Installing Educates on a cloud provider (Part 1)",
    series: cloud,
    part: 1,
  },
  {
    id: "how-installer-works-part-1",
    href: "/blog/how-installer-works-part-1",
    title: "How the installer works (Part 1)",
    series: "How the installer works",
    part: 1,
  },
];

describe("seriesOf", () => {
  it("lists the parts of the post's series in order, marking the post's own", () => {
    expect(seriesOf("verify-cloud-install", posts)).toEqual({
      name: cloud,
      part: 2,
      parts: [
        {
          href: "/blog/install-cloud-cli",
          title: "Installing Educates on a cloud provider (Part 1)",
          part: 1,
          current: false,
        },
        {
          href: "/blog/verify-cloud-install",
          title:
            "Installing Educates on a cloud provider (Part 2 - Verification)",
          part: 2,
          current: true,
        },
      ],
    });
  });

  it("gives none for a series with only one part published", () => {
    expect(seriesOf("how-installer-works-part-1", posts)).toBeUndefined();
  });

  it("gives none for a post outside any series", () => {
    expect(seriesOf("deploying-yourself", posts)).toBeUndefined();
  });

  it("fails when two posts are the same part of a series, naming both", () => {
    const clash: SeriesPost[] = [
      ...posts,
      {
        id: "install-cloud-terraform",
        href: "/blog/install-cloud-terraform",
        title: "Installing Educates on a cloud provider with Terraform",
        series: cloud,
        part: 1,
      },
    ];
    expect(() => seriesOf("verify-cloud-install", clash)).toThrow(
      /install-cloud-cli.*install-cloud-terraform|install-cloud-terraform.*install-cloud-cli/,
    );
  });
});
