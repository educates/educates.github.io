// The `educates` CLI downloads. Each release of the training platform
// publishes one binary per system and architecture, named
// `educates-<system>-<architecture>`, and GitHub's `releases/latest/download`
// URL always serves that asset from the latest release, so these links stay
// current without a site change.

const repository = "https://github.com/educates/educates-training-platform";

/** Every release, for versions other than the latest. */
export const releasesUrl = `${repository}/releases`;

/** The URL of the asset named `asset` on the latest release. */
export function latestReleaseAsset(asset: string): string {
  return `${releasesUrl}/latest/download/${asset}`;
}

/** The SHA-256 checksum of every asset of the latest release. */
export const checksumsUrl = latestReleaseAsset("checksums.txt");

/** One CLI binary: an architecture of a system. */
export interface CliBuild {
  /** The architecture as a visitor knows it, such as "Apple silicon (arm64)". */
  label: string;
  /** The release asset's name, which is also the downloaded file's name. */
  asset: string;
  href: string;
}

/** The CLI binaries for one system. */
export interface CliPlatform {
  os: string;
  builds: CliBuild[];
}

function build(label: string, system: string, architecture: string): CliBuild {
  const asset = `educates-${system}-${architecture}`;
  return { label, asset, href: latestReleaseAsset(asset) };
}

/** The CLI binaries of the latest release, by system. */
export const cliDownloads: readonly CliPlatform[] = [
  {
    os: "macOS",
    builds: [
      build("Apple silicon (arm64)", "darwin", "arm64"),
      build("Intel (amd64)", "darwin", "amd64"),
    ],
  },
  {
    os: "Linux",
    builds: [
      build("amd64", "linux", "amd64"),
      build("arm64", "linux", "arm64"),
    ],
  },
];
