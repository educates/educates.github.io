// When a video loop plays. The VideoLoop component's script asks this each
// time something it depends on changes; the rule is plain data in, a
// decision out, so it is tested without a browser.

/** What the visitor chose with the loop's play and pause button. */
export type LoopChoice = "play" | "pause";

/** What decides whether a loop plays. */
export interface LoopState {
  /** Whether the loop is on screen. */
  onScreen: boolean;
  /** Whether the visitor prefers reduced motion. */
  reducedMotion: boolean;
  /** The visitor's last press of the play and pause button, if any. */
  choice?: LoopChoice | undefined;
}

/**
 * Whether a loop plays: never off screen; on screen, as the visitor last
 * chose with its button, or until then, unless they prefer reduced motion.
 */
export function loopShouldPlay(state: LoopState): boolean {
  if (!state.onScreen) return false;
  if (state.choice) return state.choice === "play";
  return !state.reducedMotion;
}
