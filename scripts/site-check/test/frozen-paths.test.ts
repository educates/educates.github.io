import { describe, expect, it } from "vitest";
import { frozenPaths } from "../rules/frozen-paths.ts";
import { checkSite } from "../site-check.ts";
import { fixtureBuild, page } from "./fixture-build.ts";

const origin = "https://educates.dev";
const frozen = "/assets/images/arch-be5e0caa423b4a512d9a52af5ec629c2.png";

/** A post page whose body is `body`. */
function post(body: string, head = ""): string {
  return page(`${origin}/blog/post`, head).replace(
    "<h1>Page</h1>",
    `<h1>Page</h1>${body}`,
  );
}

function check(files: Record<string, string>) {
  return checkSite(fixtureBuild({ [frozen.slice(1)]: "image", ...files }), [
    frozenPaths({ origin, paths: ["/assets/images"] }),
  ]);
}

describe("frozen-paths rule", () => {
  it("passes pages that use other files", () => {
    const findings = check({
      "blog/post.html": post(
        `<img src="/_astro/arch.Bx1.webp" srcset="/_astro/arch.Bx2.webp 2x" alt=""><a href="/assets/images-elsewhere/a.png">a</a><a href="https://example.com${frozen}">b</a><p>Docusaurus wrote ${frozen}.</p>`,
      ),
    });
    expect(findings).toEqual([]);
  });

  it.each([
    ["an image by path", `<img src="${frozen}" alt="">`],
    ["an image by relative path", `<img src="../assets/images/a.png" alt="">`],
    [
      "an image candidate",
      `<img src="/_astro/a.webp" srcset="/_astro/a.webp 1x, ${origin}${frozen} 2x" alt="">`,
    ],
    ["a link", `<a href="${origin}${frozen}">Diagram</a>`],
  ])("fails a page that uses a frozen file in %s", (_, body) => {
    const findings = check({ "blog/post.html": post(body) });
    expect(findings).toMatchObject([
      { rule: "frozen-paths", severity: "error" },
    ]);
    expect(findings[0].message).toContain("blog/post.html");
    expect(findings[0].message).toContain("/assets/images/");
  });

  it("fails a page whose Open Graph image is a frozen file", () => {
    const findings = check({
      "blog/post.html": post(
        "",
        `<meta property="og:image" content="${origin}${frozen}">`,
      ),
    });
    expect(findings).toMatchObject([
      { rule: "frozen-paths", severity: "error" },
    ]);
    expect(findings[0].message).toContain(frozen);
  });
});
