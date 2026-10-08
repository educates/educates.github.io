// Turns the frames of a DevTools screencast into a video. Chrome sends a
// frame only when the page changes, so each frame is shown for as long as
// the screen stayed that way: until the next frame arrived, or the
// recording ended.

/** A frame saved from the screencast, with when Chrome painted it, in seconds. */
export interface Frame {
  file: string;
  timestamp: number;
}

/**
 * An ffmpeg concat list showing the frames from `start` to `end`, each
 * until the next. The screen at `start` is the last frame painted before
 * it; frames painted after `end` are left out.
 */
export function frameList(
  frames: readonly Frame[],
  recording: { start: number; end: number },
): string {
  const sorted = [...frames].sort((a, b) => a.timestamp - b.timestamp);
  const firstShown = Math.max(
    0,
    sorted.findLastIndex((frame) => frame.timestamp <= recording.start),
  );
  const shown = sorted
    .slice(firstShown)
    .filter((frame) => frame.timestamp < recording.end);
  const lines = ["ffconcat version 1.0"];
  shown.forEach((frame, index) => {
    const from = Math.max(frame.timestamp, recording.start);
    const until = shown[index + 1]?.timestamp ?? recording.end;
    lines.push(`file '${frame.file}'`, `duration ${(until - from).toFixed(3)}`);
  });
  // ffmpeg ignores the duration of the last entry unless it is repeated.
  const last = shown.at(-1);
  if (last) lines.push(`file '${last.file}'`);
  return `${lines.join("\n")}\n`;
}
