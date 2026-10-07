import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Writes a small build output to a new temporary directory and returns its
 * path. Keys are paths relative to the build root, values file contents.
 */
export function fixtureBuild(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "site-check-"));
  for (const [path, content] of Object.entries(files)) {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return root;
}

/** A page with the head the base layout writes for `url`. */
export function page(url: string, extraHead = ""): string {
  return `<!doctype html><html lang="en"><head><title>Page</title><link rel="canonical" href="${url}"><meta property="og:url" content="${url}">${extraHead}</head><body><main><h1>Page</h1></main></body></html>`;
}

/** An HTML redirect page in the form Astro's `redirects` writes. */
export function redirectPage(target: string): string {
  const canonical = new URL(target, "https://educates.dev").href;
  return `<!doctype html><title>Redirecting to: ${target}</title><meta http-equiv="refresh" content="0;url=${target}"><meta name="robots" content="noindex"><link rel="canonical" href="${canonical}"><body><a href="${target}">Redirecting to <code>${target}</code></a></body>`;
}
