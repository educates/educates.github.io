// The components MDX posts use without importing them, as on the Docusaurus
// site: pass them to a post's <Content components={postComponents} />.
// The blog feeds render posts with their own counterparts, under the same
// names, from feed-components.ts; a component added here needs one there.

import AsciinemaPlayer from "./AsciinemaPlayer.astro";
import YouTubeVideo from "./YouTubeVideo.astro";

export const postComponents = { AsciinemaPlayer, YouTubeVideo };
