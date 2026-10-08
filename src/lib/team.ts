// The people behind Educates, shown on the Community page. Photos are their
// GitHub avatars, kept in the repository so the page loads nothing from
// another site.

import type { ImageMetadata } from "astro";
import billKable from "../assets/team/bill-kable.jpg";
import grahamDumpleton from "../assets/team/graham-dumpleton.jpg";
import jorgeMorales from "../assets/team/jorge-morales.jpg";

export interface TeamMember {
  name: string;
  role: string;
  photo: ImageMetadata;
  /** Profiles elsewhere, such as GitHub and LinkedIn. */
  profiles: { site: string; href: string }[];
}

export const team: readonly TeamMember[] = [
  {
    name: "Graham Dumpleton",
    role: "Project co-lead",
    photo: grahamDumpleton,
    profiles: [
      { site: "GitHub", href: "https://github.com/GrahamDumpleton" },
      { site: "LinkedIn", href: "https://linkedin.com/in/GrahamDumpleton" },
    ],
  },
  {
    name: "Jorge Morales",
    role: "Project co-lead",
    photo: jorgeMorales,
    profiles: [
      { site: "GitHub", href: "https://github.com/jorgemoralespou" },
      { site: "LinkedIn", href: "https://linkedin.com/in/jorgemoralespou" },
    ],
  },
  {
    name: "Bill Kable",
    role: "Project contributor",
    photo: billKable,
    profiles: [
      { site: "GitHub", href: "https://github.com/billkable" },
      { site: "LinkedIn", href: "https://linkedin.com/in/billkable" },
    ],
  },
];
