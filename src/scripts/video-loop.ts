// The video loops on a page, from the VideoLoop component.
//
// Each `[data-video-loop]` arrives showing its poster, with its video's URL
// in the <video>'s `data-src` and nothing loaded. The first time the loop
// should play, its source is set, so a loop the visitor never reaches, or
// keeps paused, costs nothing. `loopShouldPlay()` decides: it plays while on
// screen, pauses off screen, and stays paused for a visitor who prefers
// reduced motion until they press Play.

import { loopShouldPlay, type LoopChoice } from "../lib/video-loop.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How much of a loop must be on screen for it to play. */
const ON_SCREEN_RATIO = 0.25;

/** Wires every video loop on the page. */
export function setUpVideoLoops(): void {
  const roots = document.querySelectorAll<HTMLElement>(
    "[data-video-loop]:not([data-video-loop-ready])",
  );
  if (roots.length === 0) return;
  const motion = window.matchMedia(REDUCED_MOTION);
  const updates = new Map<Element, (onScreen?: boolean) => void>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        updates.get(entry.target)?.(entry.intersectionRatio >= ON_SCREEN_RATIO);
      }
    },
    { threshold: [0, ON_SCREEN_RATIO] },
  );
  for (const root of roots) {
    const update = setUpVideoLoop(root, motion);
    if (!update) continue;
    updates.set(root, update);
    observer.observe(root);
  }
  motion.addEventListener("change", () => {
    for (const update of updates.values()) update();
  });
}

/**
 * Wires one loop, returning the function that tells it whether it is on
 * screen, or called with nothing, to decide again as it is.
 */
function setUpVideoLoop(
  root: HTMLElement,
  motion: MediaQueryList,
): ((onScreen?: boolean) => void) | undefined {
  const video = root.querySelector("video");
  const button = root.querySelector<HTMLButtonElement>(
    "[data-video-loop-toggle]",
  );
  const action = root.querySelector("[data-video-loop-action]");
  const source = video?.dataset.src;
  if (!video || !button || !action || !source) return undefined;
  root.dataset.videoLoopReady = "";

  let onScreen = false;
  let choice: LoopChoice | undefined;

  const decide = () => {
    const play = loopShouldPlay({
      onScreen,
      reducedMotion: motion.matches,
      choice,
    });
    // The button offers what pressing it would do on screen.
    const playing = loopShouldPlay({
      onScreen: true,
      reducedMotion: motion.matches,
      choice,
    });
    button.dataset.playing = String(playing);
    action.textContent = playing ? "Pause" : "Play";
    if (play) {
      if (!video.getAttribute("src")) video.src = source;
      video.play().catch((error: unknown) => {
        // A browser that refuses to play leaves the poster and offers Play;
        // a play cut short by a pause needs nothing.
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          choice = "pause";
          decide();
        }
      });
    } else if (!video.paused) {
      video.pause();
    }
  };

  button.addEventListener("click", () => {
    choice = button.dataset.playing === "true" ? "pause" : "play";
    decide();
  });
  button.hidden = false;
  decide();

  return (next) => {
    if (next !== undefined) onScreen = next;
    decide();
  };
}
