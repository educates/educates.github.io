// The components MDX posts use, as the blog feeds render them. A feed
// reader runs no scripts, so each renders as a link: to the post for a
// terminal recording, to the video for a video. Every component in
// `postComponents` needs its feed counterpart here, or the type check
// fails.

import FeedRecordingLink from "./FeedRecordingLink.astro";
import FeedVideoLink from "./FeedVideoLink.astro";
import type { postComponents } from "./post-components.ts";

export const feedComponents = {
  AsciinemaPlayer: FeedRecordingLink,
  YouTubeVideo: FeedVideoLink,
} satisfies Record<keyof typeof postComponents, unknown>;
