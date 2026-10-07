// YouTube videos: pressing play swaps the poster for the player from
// youtube-nocookie.com, so nothing reaches Google before the reader asks
// for the video. A click with a modifier key, or a middle click, follows
// the play button's link to the video on YouTube instead.

const playerFeatures =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/** Wires every `[data-youtube-video]` on the page. */
export function setUpYouTubeVideos(): void {
  const videos = document.querySelectorAll<HTMLElement>("[data-youtube-video]");
  for (const video of videos) {
    const play = video.querySelector<HTMLAnchorElement>("[data-youtube-play]");
    const frame = play?.parentElement;
    const { embed, title } = video.dataset;
    if (!play || !frame || !embed || !title) continue;
    play.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      const player = document.createElement("iframe");
      player.src = embed;
      player.title = title;
      player.allow = playerFeatures;
      player.allowFullscreen = true;
      player.referrerPolicy = "strict-origin-when-cross-origin";
      frame.replaceChildren(player);
      player.focus();
    });
  }
}
