# Release-specific strings in the Getting Started Guides

The Getting Started Guides (`src/content/guides/`) show versions and
command outputs that belong to one Educates release: the release the
guides' install commands download. Those commands fetch
`releases/latest`, so the guides follow the latest released CLI, GitHub's
"Latest" on `educates/educates-training-platform`, not an unreleased build.
The guides currently follow **3.8.0**.

This file lists, page by page, which strings are release-specific, where
each value comes from, and how to refresh them for a new release.

## Ground rules

- **Find the release.** `gh release list -R educates/educates-training-platform --limit 3`
  shows which tag is "Latest".
- **Read the source at the tag, never from memory, and never check it
  out.** From a local clone of the platform:
  `git -C <platform-clone> show <tag>:<path>`. Without a clone:
  `gh api "repos/educates/educates-training-platform/contents/<path>?ref=<tag>" -H "Accept: application/vnd.github.raw"`.
  The same `gh api` form reads Kind, Kubernetes, kapp and imgpkg at their
  own tags.
- **Run the released CLI only for what is safe.** Download it into a new,
  empty temporary directory, check it against the release's
  `checksums.txt`, and run only `version` and `--help`:

  ```sh
  dir=$(mktemp -d)
  gh release download <tag> -R educates/educates-training-platform \
    -p educates-darwin-arm64 -p checksums.txt -D "$dir"
  (cd "$dir" && grep educates-darwin-arm64 checksums.txt | shasum -a 256 -c)
  chmod +x "$dir/educates-darwin-arm64"
  "$dir/educates-darwin-arm64" version
  "$dir/educates-darwin-arm64" deploy-workshop --help
  ```

- **Outputs that need a cluster** (pod names, ages, timings, digests,
  change counts) come only from a real run on a fresh machine or VM. When
  you cannot run one, keep the output's shape, change only what the source
  at the tag fixes (versions, image and component names, columns), and
  list what you could not verify.
- **Keep colon-joined values in code.** The Markdown pipeline parses
  something like `kindest/node:v1.36.1` in prose as a directive and drops
  it silently, so versions with a colon stay in code spans or code blocks.

## Values for 3.8.0

| Value | 3.8.0 | Where it comes from |
| --- | --- | --- |
| Educates CLI version | `3.8.0` | `educates version` of the released binary |
| Kind library | `v0.32.0` | `sigs.k8s.io/kind` in `client-programs/go.mod` at the tag |
| Kind node image | `kindest/node:v1.36.1` | `pkg/apis/config/defaults/image.go` in Kind at `v0.32.0` |
| Kubernetes minor for the kubectl repositories | `v1.36` | the node image's Kubernetes version |
| kubectl patch release | `v1.36.5` | `https://dl.k8s.io/release/stable-1.36.txt` |
| Kustomize in that kubectl | `v5.8.1` | `sigs.k8s.io/kustomize/kustomize/v5` in Kubernetes' `go.mod` at `v1.36.5` |
| Kyverno | `v1.15.1` | `vendir.yml` at the tag |
| Contour | `v1.30.2` | `vendir.yml` at the tag |
| kapp library | `v0.64.2` | `carvel.dev/kapp` in `client-programs/go.mod` at the tag |

The installer bundle's paths below are relative to
`carvel-packages/installer/bundle/config/ytt/_ytt_lib/` in the platform
repository, written as `<bundle>/`.

## Set up

### Installing Docker (`setup/docker.md`)

Nothing here follows the Educates release. The `hello-world` output is
Docker's own; its `(arm64v8)` line names the architecture of the machine
it was captured on.

### Installing kubectl (`setup/kubectl.mdx`)

Release-specific strings:

- `v1.36` in the six `pkgs.k8s.io/core:/stable:/v1.36/...` URLs of the
  Debian, Red Hat and SUSE tabs.
- `Client Version: v1.36.5` and `Kustomize Version: v5.8.1` in the
  sample output.

The repositories follow the Kubernetes minor of the Kind node image the
CLI creates its cluster from (see the next page), so kubectl matches the
cluster it talks to. To refresh:

```sh
# The minor's package repository exists
curl -fsSL -o /dev/null -w '%{http_code}\n' https://pkgs.k8s.io/core:/stable:/v<minor>/deb/Release.key
# Its current patch release
curl -fsSL https://dl.k8s.io/release/stable-<minor>.txt
# The Kustomize that kubectl reports
gh api "repos/kubernetes/kubernetes/contents/go.mod?ref=<patch>" \
  -H "Accept: application/vnd.github.raw" | grep kustomize/kustomize/v5
```

Not pinned on purpose: the release binary command reads `stable.txt`,
the newest Kubernetes release, and Homebrew and MacPorts install their
newest kubectl, so on those paths a reader may get a newer minor than the
sample output shows.

### Installing the Educates CLI (`setup/educates.mdx`)

Release-specific string: `3.8.0` in the `educates version` output. The
command prints the version alone
(`client-programs/pkg/cmd/project_version_cmd.go`); take it from the
released binary as in the ground rules.

### Creating an Educates cluster (`setup/create-cluster.md`)

Release-specific strings and where they come from:

- **`kindest/node:v1.36.1`** in "Ensuring node image". The CLI's
  `--kind-cluster-image` defaults to empty (see `create-cluster --help`),
  so Kind uses its default node image. Read the Kind version from
  `client-programs/go.mod`, then the image from Kind:

  ```sh
  gh api "repos/kubernetes-sigs/kind/contents/pkg/apis/config/defaults/image.go?ref=<kind-version>" \
    -H "Accept: application/vnd.github.raw"
  ```

  Kind shows the image without its `@sha256:` digest.
- **Kind's lines** (`Creating cluster`, the ` ✓ ` status lines, ` • Ready
  after`, the kubectl context lines and the closing salutation) come from
  Kind at that version: `pkg/cluster/internal/create/create.go`, the
  actions under `pkg/cluster/internal/create/actions/`, and
  `pkg/internal/cli/status.go` for the ` ✓ %s` format. The salutation is
  one of four, picked at random.
- **`Cluster config used is saved to:  <path>`** comes from
  `client-programs/pkg/cluster/kindcluster.go`. It prints on one line
  with two spaces, because `Println` adds a space between its two
  operands. The directory is the XDG data home plus `educates`
  (`client-programs/pkg/utils/dirs.go`): `~/Library/Application Support`
  on macOS, `~/.local/share` on Linux.
- **The registry lines** come from `client-programs/pkg/registry/registry.go`.
- **The kapp lines.** 3.8.0 installs Educates with the kapp library
  (`client-programs/pkg/installer/installer.go`), which prints
  `<time>: ---- applying <n> changes [<done>/<total> done] ----` and the
  matching "complete" lines (kapp's `pkg/kapp/cmd/core/messages_ui.go`).
- **`Educates cluster has been created succesfully`** comes from
  `client-programs/pkg/cmd/local_cluster_create_cmd.go`, misspelling
  included.

Only a real run gives: `Ready after 14s`, the kapp timestamps, and the
change counts (`7`, `137`).

## What you just installed (`about.md`)

**The pod list.** Kind's `kube-system` and `local-path-storage` pods need
a real run to confirm. The other namespaces follow the installer bundle at
the tag:

- The packages a Kind cluster gets are listed in
  `<bundle>/infrastructure/kind/defaults.star`: Contour, Kyverno and
  Educates.
- `educates`: `session-manager`
  (`<bundle>/packages/educates/11-session-manager/07-deployments.yaml`),
  `image-puller` (`.../07-daemonsets.yaml`, on by default) and
  `secrets-manager`
  (`<bundle>/packages/educates/10-secrets-manager/07-deployments.yaml`).
  The lookup service is off by default, so it has no pod.
- `kyverno`: the Deployments and any CronJobs in
  `<bundle>/packages/kyverno/upstream/install.yaml`. Kyverno v1.15.1 has
  four Deployments and no CronJobs.
- `projectcontour`: one `contour` pod (the Kind settings set one
  replica), one `envoy` pod (a DaemonSet on one node), and the certgen
  Job, whose name carries the Contour version
  (`<bundle>/packages/contour/upstream/02-job-certgen.yaml`, for example
  `contour-certgen-v1-30-2`).

The random suffixes need a real run; the page already says they differ.

**The cluster policies.** The names are the files in
`<bundle>/packages/educates/_ytt_lib/kyverno-baseline/upstream/` and
`.../kyverno-restricted/upstream/`, prefixed `educates-baseline-` and
`educates-restricted-` by each folder's `overlays.yaml`; the restricted
overlay also removes `restrict-seccomp-strict`. List them with:

```sh
git -C <platform-clone> ls-tree -r --name-only <tag> \
  carvel-packages/installer/bundle/config/ytt/_ytt_lib/packages/educates/_ytt_lib/ \
  | grep -E 'kyverno-(baseline|restricted)/upstream/.*\.yaml$'
```

The columns are the `additionalPrinterColumns` without a `priority` of the
`clusterpolicies.kyverno.io` CRD in Kyverno's `install.yaml`. kubectl
pads each column to its widest cell plus three spaces, and to at least
six. `READY`, `AGE` and `MESSAGE` values need a real run.

**The custom resource definitions.** The ten names come from
`<bundle>/packages/educates/10-secrets-manager/01-crds-*.yaml` and
`<bundle>/packages/educates/11-session-manager/01-crds-*.yaml`. The lookup
service's three `lookup.educates.dev` definitions appear only when it is
enabled. The page's sentence "A local install has ten, in two API groups"
changes with the list.

## Write your first workshop

### Workshop basics (`authoring/basics.md`)

- **The layout tree and the published file list** follow the default
  `hugo` template, `client-programs/pkg/templates/files/hugo/`. `tree`
  hides its `.gitignore`; `publish-workshop` lists it.
- **`publish-workshop`** prints from `client-programs/pkg/workshops/publish.go`,
  and the `dir:`, `file:` and `Pushed` lines come from imgpkg
  (`pkg/imgpkg/image/tar_image.go` and `pkg/imgpkg/cmd/push.go`). The
  digest needs a real run.
- **`deploy-workshop`** prints from
  `client-programs/pkg/cmd/cluster_workshop_deploy_cmd.go`. The suffix of
  `educates-cli--demo-workshop-efb97a1` is the last seven hex digits of a
  SHA-1 of the workshop file's path (`generateWorkshopName` in
  `cluster_workshop_update_cmd.go`), so it differs on every machine.
- **`browse-workshops`** prints from
  `client-programs/pkg/cmd/cluster_portal_open_cmd.go`.

### Setup scripts and interactivity (`authoring/startup-interactivity.md`)

The `workshop.yaml` example is the `hugo` template's
`resources/workshop.yaml` rendered with `new-workshop`'s defaults
(terminal and editor on, everything else off, Kubernetes access off),
plus the two `examiner` lines the page asks the reader to add. The
fence's `{28-29}` highlights those two lines: move it if the template
gains or loses lines. To compare, read the template at the tag and the
flag defaults in `client-programs/pkg/cmd/workshop_new_cmd.go`.

### Live editing, Next steps and the index pages

These show commands but no outputs. Check that the flags they use still
exist with `--help` of the new release: `serve-workshop --patch-workshop`,
`deploy-workshop -f`, `delete-workshop -f` and `delete-cluster --all`.

The guides' screenshots are not covered here.

## Refreshing for a new release

1. Confirm the new tag is GitHub's "Latest".
2. Download its CLI as in the ground rules, run `version`, and run
   `--help` for every command the guides use.
3. See what changed since the release the guides follow:
   `git -C <platform-clone> diff <old-tag> <new-tag> -- client-programs/go.mod vendir.yml client-programs/pkg carvel-packages/installer/bundle/config/ytt`.
4. Work through the pages above, reading each value from its source at the
   new tag.
5. For outputs that need a cluster, run the guides end to end on a fresh
   machine or VM and paste the outputs, or keep their shape and list what
   you could not verify.
6. Update "The guides currently follow" at the top of this file and the
   values table.

## Refreshing for 4.0

On `develop` (4.0), `educates create-cluster` installs the platform with
Helm, an operator plus platform custom resources, instead of the kapp
installer, and the CLI depends on a newer Kind. So beyond the steps above:

- **Creating an Educates cluster:** the kapp lines go away. Capture the
  new output from a real run rather than editing the 3.8.0 one.
- **What you just installed:** the workloads, the custom resource
  definitions and possibly the policies change. Read them from the 4.0
  chart and operator at the tag (the `installer/` directory) or capture
  them from a run, and recheck the page's prose about them, not only its
  code blocks.
- **The Kind node image and the kubectl repositories:** same method, from
  the Kind version in 4.0's `client-programs/go.mod`.
