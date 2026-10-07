// The visual slots of the Feature entries: the places on the Features
// pages that show a screenshot or a recording, each filled by one shot of
// the capture manifest.

/** A loop as an entry declares it: what it shows, and its files once captured. */
export interface EntryLoop {
  alt: string;
  video?: string | undefined;
  poster?: string | undefined;
}

/** An image as an entry declares it. */
export interface EntryVisual {
  src: string;
  alt: string;
}

/** The parts of a Feature entry's frontmatter that hold visuals. */
export interface FeatureEntry {
  /** The entry's id, its file name without the extension. */
  id: string;
  data: {
    educates4Only?: boolean | undefined;
    visual?: EntryVisual | undefined;
    page?:
      | {
          loop: EntryLoop;
          things: {
            title: string;
            visual?: EntryVisual | undefined;
            loop?: EntryLoop | undefined;
          }[];
        }
      | undefined;
  };
}

/**
 * Where on a Feature's pages a capture goes: its screenshot on the Features
 * overview (`"visual"`), the loop beside its deep page's headline
 * (`"loop"`), or the visual of one of the deep page's things, by its index.
 */
export type Slot = "visual" | "loop" | number;

export type CaptureKind = "screenshot" | "loop";

export interface VisualSlot {
  feature: string;
  slot: Slot;
  kind: CaptureKind;
}

/**
 * Every visual slot of the Features the site shows, in the entries' order.
 * 4.0-only Features count only once 4.0 is released.
 */
export function visualSlots(
  entries: readonly FeatureEntry[],
  options: { educates4Released?: boolean } = {},
): VisualSlot[] {
  return entries
    .filter((entry) => options.educates4Released || !entry.data.educates4Only)
    .flatMap((entry): VisualSlot[] => {
      const page = entry.data.page;
      const overview: VisualSlot = {
        feature: entry.id,
        slot: "visual",
        kind: "screenshot",
      };
      if (!page) return [overview];
      return [
        overview,
        { feature: entry.id, slot: "loop", kind: "loop" },
        ...page.things.map((thing, index): VisualSlot => ({
          feature: entry.id,
          slot: index,
          kind: thing.loop ? "loop" : "screenshot",
        })),
      ];
    });
}

/** A shot of the capture manifest, as far as the slot it fills. */
export interface ShotTarget {
  id: string;
  feature: string;
  slot: Slot;
  kind: CaptureKind;
}

/**
 * The files a shot makes, named after its id and relative to the Feature
 * entries' folder, the way an entry names them: a WebP screenshot, or a
 * loop's MP4 video with its WebP poster.
 */
export function captureFiles(
  shot: ShotTarget,
): { image: string } | { video: string; poster: string } {
  if (shot.kind === "loop") {
    return { video: `./${shot.id}.mp4`, poster: `./${shot.id}-poster.webp` };
  }
  return { image: `./${shot.id}.webp` };
}

/**
 * The shots whose entry does not show their files in their slot, so a
 * capture that was taken but not wired, or wired to another file, is
 * caught.
 */
export function wiringProblems(
  shots: readonly ShotTarget[],
  entries: readonly FeatureEntry[],
): string[] {
  return shots.flatMap((shot) => {
    const entry = entries.find((candidate) => candidate.id === shot.feature);
    const files = captureFiles(shot);
    const shown = entry ? slotContent(entry, shot.slot) : undefined;
    const wired =
      "image" in files
        ? shown?.visual?.src === files.image
        : shown?.loop?.video === files.video &&
          shown?.loop?.poster === files.poster;
    if (wired) return [];
    const named = "image" in files ? files.image : files.video;
    return [
      `${shot.id}: ${shot.feature} does not show ${named} as ${slotName(shot.slot)}`,
    ];
  });
}

/** What an entry shows in a slot: a visual, a loop, or nothing yet. */
function slotContent(
  entry: FeatureEntry,
  slot: Slot,
):
  | { visual?: EntryVisual | undefined; loop?: EntryLoop | undefined }
  | undefined {
  if (slot === "visual") return { visual: entry.data.visual };
  if (slot === "loop") return { loop: entry.data.page?.loop };
  return entry.data.page?.things[slot];
}

/** How a slot reads in a problem: `visual`, `loop`, or `thing 2`, counting from 1. */
function slotName(slot: Slot): string {
  return typeof slot === "number" ? `thing ${slot + 1}` : slot;
}

/**
 * What keeps the shots from filling the slots one each: a slot with no
 * shot, a slot with more than one, a shot for a slot that does not exist,
 * or a shot of the wrong kind for its slot.
 */
export function coverageProblems(
  shots: readonly ShotTarget[],
  slots: readonly VisualSlot[],
): string[] {
  const problems: string[] = [];
  for (const slot of slots) {
    const filling = shots.filter(
      (shot) => shot.feature === slot.feature && shot.slot === slot.slot,
    );
    if (filling.length === 0) {
      problems.push(`${slot.feature}: ${slotName(slot.slot)} has no shot`);
    } else if (filling.length > 1) {
      problems.push(
        `${slot.feature}: ${slotName(slot.slot)} has ${filling.length} shots: ${filling.map((shot) => shot.id).join(", ")}`,
      );
    }
  }
  for (const shot of shots) {
    const slot = slots.find(
      (candidate) =>
        candidate.feature === shot.feature && candidate.slot === shot.slot,
    );
    if (!slot) {
      problems.push(
        `${shot.id}: ${shot.feature} has no ${slotName(shot.slot)} to fill`,
      );
    } else if (slot.kind !== shot.kind) {
      problems.push(
        `${shot.id}: a ${shot.kind}, but ${shot.feature}'s ${slotName(shot.slot)} takes a ${slot.kind}`,
      );
    }
  }
  return problems;
}
