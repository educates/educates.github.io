import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { parse } from "node-html-parser";
import { createElement } from "react";
import satori, { type SatoriOptions } from "satori";
import sharp from "sharp";
import Cover from "../components/Cover.tsx";
import type { CoverProps } from "../lib/cover.ts";
import { pageCover } from "../lib/page-cover.ts";
import { lightTokens } from "../styles/tokens.ts";

export interface OpenGraphImagesOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
}

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Writes the Open Graph image of every page after the build: for each built
 * page whose `og:image` points under `/og/` (see `openGraphImageUrl()` in
 * src/lib/urls.ts), it draws the page's cover, from what `pageCover()`
 * reads in the page, in the light palette, and writes it there as a 1200
 * by 630 PNG. A page whose `og:image` is its own cover image is left alone.
 * The images exist only in a build, not in the dev server.
 */
export function openGraphImages({
  origin,
}: OpenGraphImagesOptions): AstroIntegration {
  let root: URL;
  return {
    name: "open-graph-images",
    hooks: {
      "astro:config:done": ({ config }) => {
        root = config.root;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const build = fileURLToPath(dir);
        const fonts = await coverFonts(root);
        const logo = `data:image/svg+xml;base64,${(
          await readFile(new URL("public/img/logo.svg", root))
        ).toString("base64")}`;
        const prefix = `${origin}/og/`;

        const pages = (await readdir(build, { recursive: true })).filter(
          (file) => file.endsWith(".html"),
        );
        let written = 0;
        for (const page of pages) {
          const html = await readFile(join(build, page), "utf8");
          const image = parse(html)
            .querySelector('meta[property="og:image"]')
            ?.getAttribute("content");
          if (!image?.startsWith(prefix)) continue;

          const target = join(build, decodeURI(new URL(image).pathname));
          let png: Buffer;
          try {
            png = await render(pageCover(html), { fonts, logo });
          } catch (error) {
            throw new Error(`The Open Graph image of ${page} failed`, {
              cause: error,
            });
          }
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, png);
          written += 1;
        }
        logger.info(`${written} Open Graph images written under og/`);
      },
    },
  };
}

/** A page's cover as a PNG, through satori and sharp. */
async function render(
  cover: CoverProps,
  { fonts, logo }: { fonts: SatoriOptions["fonts"]; logo: string },
): Promise<Buffer> {
  const svg = await satori(
    createElement(Cover, {
      ...cover,
      logo,
      use: "open-graph",
      tokens: lightTokens,
    }),
    { width: WIDTH, height: HEIGHT, fonts },
  );
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * The site's two families at the weights it loads, from the Fontsource
 * packages' WOFF files (satori reads WOFF, not WOFF2), under the family
 * names of the site's `@font-face` rules.
 */
async function coverFonts(root: URL): Promise<SatoriOptions["fonts"]> {
  const require = createRequire(new URL("package.json", root));
  const families = [
    { name: "Onest", package: "onest" },
    { name: "JetBrains Mono", package: "jetbrains-mono" },
  ];
  const weights = [400, 600, 700] as const;
  const subsets = ["latin", "latin-ext"];
  return Promise.all(
    families.flatMap((family) =>
      weights.flatMap((weight) =>
        subsets.map(async (subset) => ({
          name: family.name,
          weight,
          style: "normal" as const,
          data: await readFile(
            require.resolve(
              `@fontsource/${family.package}/files/${family.package}-${subset}-${weight}-normal.woff`,
            ),
          ),
        })),
      ),
    ),
  );
}
