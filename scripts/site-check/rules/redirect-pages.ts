import type { HTMLElement } from "node-html-parser";
import {
  isRedirectPage,
  type Build,
  type Finding,
  type Rule,
} from "../site-check.ts";

export interface RedirectPagesOptions {
  /** The site's origin, such as `https://educates.dev`. */
  origin: string;
  /** The site's redirects, from a URL path to its target path or URL. */
  redirects: Readonly<Record<string, string>>;
}

/**
 * Every redirect page sends the visitor on at once and keeps itself out of
 * search results: an immediate meta refresh to its target, `robots`
 * `noindex`, and a canonical link to the target's absolute URL. A target on
 * the site is served by the build, and each configured redirect is served
 * as a redirect page to its configured target.
 */
export function redirectPages({
  origin,
  redirects,
}: RedirectPagesOptions): Rule {
  return {
    name: "redirect-pages",
    check(build) {
      const findings: Finding[] = [];
      const fail = (message: string) =>
        findings.push({ rule: "redirect-pages", severity: "error", message });

      for (const [source, target] of Object.entries(redirects)) {
        const file = build.resolve(source);
        if (file === undefined) {
          fail(`${source} is not served by the build; it must redirect`);
        } else if (!isRedirectPage(build.html(file))) {
          fail(
            `${source} (${file}) has no meta refresh; it must redirect to ${target}`,
          );
        } else {
          const actual = refreshOf(build.html(file)).target;
          if (actual !== undefined && !sameUrl(actual, target, origin)) {
            fail(`${source} redirects to ${actual}, not to ${target}`);
          }
        }
      }

      const redirectFiles = [...build.files]
        .filter((file) => file.endsWith(".html"))
        .filter((file) => isRedirectPage(build.html(file)))
        .sort();
      for (const file of redirectFiles) {
        for (const problem of redirectProblems(build, file, origin)) {
          fail(`${file}: ${problem}`);
        }
      }
      return findings;
    },
  };
}

function redirectProblems(
  build: Build,
  file: string,
  origin: string,
): string[] {
  const document = build.html(file);
  const problems: string[] = [];
  const { content, delay, target } = refreshOf(document);
  if (delay !== 0) {
    problems.push(
      `its meta refresh "${content}" is not immediate; it must wait 0 seconds`,
    );
  }
  const targetUrl = target === undefined ? undefined : absolute(target, origin);
  if (targetUrl === undefined) {
    problems.push(`its meta refresh "${content}" has no target URL`);
  } else if (
    targetUrl.origin === origin &&
    build.resolve(targetUrl.pathname) === undefined
  ) {
    problems.push(
      `it redirects to ${target}, which is not served by the build`,
    );
  }

  const robots = document
    .querySelectorAll('meta[name="robots"]')
    .map((meta) => meta.getAttribute("content") ?? "");
  if (!robots.some((value) => /\bnoindex\b/i.test(value))) {
    problems.push('it lacks <meta name="robots" content="noindex">');
  }

  const links = document.querySelectorAll('link[rel="canonical"]');
  if (links.length === 0) {
    problems.push("it has no canonical link");
  } else if (targetUrl !== undefined) {
    const href = links[0].getAttribute("href") ?? "";
    if (href !== targetUrl.href) {
      problems.push(
        `its canonical link ${href} is not ${targetUrl.href}, the absolute URL of its target`,
      );
    }
  }
  return problems;
}

/** The content of a page's meta refresh, such as `0;url=/community`, read. */
function refreshOf(document: HTMLElement): {
  content: string;
  delay: number | undefined;
  target: string | undefined;
} {
  const content =
    document
      .querySelector('meta[http-equiv="refresh"]')
      ?.getAttribute("content") ?? "";
  const match = /^\s*(\d+)\s*(?:[;,]\s*(?:url\s*=\s*)?(.*))?$/i.exec(content);
  if (!match) return { content, delay: undefined, target: undefined };
  const target = match[2]?.trim().replace(/^(['"])(.*)\1$/, "$2");
  return { content, delay: Number(match[1]), target: target || undefined };
}

function absolute(url: string, origin: string): URL | undefined {
  try {
    return new URL(url, origin);
  } catch {
    return undefined;
  }
}

function sameUrl(a: string, b: string, origin: string): boolean {
  return absolute(a, origin)?.href === absolute(b, origin)?.href;
}
