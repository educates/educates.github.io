// The components MDX posts use without importing them, as on the Docusaurus
// site: pass them to a post's <Content components={postComponents} />.
// Something that renders a post elsewhere, such as a feed, can pass its own
// component under the same name.

import AsciinemaPlayer from "./AsciinemaPlayer.astro";
import YouTubeVideo from "./YouTubeVideo.astro";

export const postComponents = { AsciinemaPlayer, YouTubeVideo };
