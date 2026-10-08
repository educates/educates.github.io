// The Asciinema player as a React island: it renders an empty box on the
// server, and in the browser loads asciinema-player and plays the cast in it.
// Use it through AsciinemaPlayer.astro, which hydrates it once visible.

import "asciinema-player/dist/bundle/asciinema-player.css";
import { useEffect, useRef } from "react";
import type { Options } from "asciinema-player";

/** The player's options that are plain data, so they can cross to the island. */
export type AsciinemaOptions = Omit<Options, "logger">;

export interface AsciinemaIslandProps {
  /** The URL of the cast, such as `/asciinemas/terraform-init.cast`. */
  src: string;
  options?: AsciinemaOptions;
}

export default function AsciinemaIsland({
  src,
  options = {},
}: AsciinemaIslandProps) {
  const container = useRef<HTMLDivElement>(null);
  const settings = JSON.stringify(options);

  useEffect(() => {
    let disposed = false;
    let player: { dispose(): void } | undefined;
    import("asciinema-player").then(({ create }) => {
      if (disposed || !container.current) return;
      player = create(src, container.current, JSON.parse(settings));
    });
    return () => {
      disposed = true;
      player?.dispose();
    };
  }, [src, settings]);

  return <div className="asciinema" ref={container} />;
}
