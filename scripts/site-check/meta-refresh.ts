import type { HTMLElement } from "node-html-parser";

/** A page's meta refresh, read: its content, delay and target as written. */
export interface MetaRefresh {
  /** The `content` attribute, such as `0;url=/community`, or "" for none. */
  content: string;
  /** The seconds to wait, or `undefined` when the content is unreadable. */
  delay: number | undefined;
  /** The target URL as written, or `undefined` when there is none. */
  target: string | undefined;
}

/** Reads the meta refresh of a parsed HTML page. */
export function metaRefresh(document: HTMLElement): MetaRefresh {
  const content =
    document
      .querySelector('meta[http-equiv="refresh"]')
      ?.getAttribute("content") ?? "";
  const match = /^\s*(\d+)\s*(?:[;,]\s*(?:url\s*=\s*)?(.*))?$/i.exec(content);
  if (!match) return { content, delay: undefined, target: undefined };
  const target = match[2]?.trim().replace(/^(['"])(.*)\1$/, "$2");
  return { content, delay: Number(match[1]), target: target || undefined };
}
