/** A URL path the built site must serve, and the list section it is in. */
export interface MustResolveEntry {
  path: string;
  section: string;
}

/**
 * Reads the must-resolve list: one URL path per line, starting with `/`.
 * A `[Section]` line names the section of the entries below it, `#` starts
 * a comment, and blank lines are ignored. Throws on an entry that is not a
 * URL path or is listed twice.
 */
export function parseMustResolveList(text: string): MustResolveEntry[] {
  const entries: MustResolveEntry[] = [];
  const seen = new Set<string>();
  let section = "";
  text.split("\n").forEach((rawLine, index) => {
    const line = rawLine.trim();
    const where = `line ${index + 1}`;
    if (line === "" || line.startsWith("#")) return;
    const heading = /^\[(.+)\]$/.exec(line);
    if (heading) {
      section = heading[1];
      return;
    }
    if (!line.startsWith("/")) {
      throw new Error(`${where}: "${line}" is not a URL path`);
    }
    if (seen.has(line)) {
      throw new Error(`${where}: "${line}" is listed twice`);
    }
    seen.add(line);
    entries.push({ path: line, section });
  });
  return entries;
}
