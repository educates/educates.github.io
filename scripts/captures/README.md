# Captures

The screenshots and the short muted loops on the Features pages come from a
running Educates, not from mock-ups. This folder holds the tool that takes
them, and `captures/` at the repository root holds what it drives:

- `captures/workshop/` is the capture workshop, Educates Feature Tour. Each
  instruction page sets up one shot or a group of them: clickable actions,
  examiner checks, the editor, the console, the slides, the Session's own
  Docker daemon, registry and Git server, its namespace and quota, the
  portal's REST API, the lookup service, workshop definitions, the
  Terraform modules' usage and a course written with the AI authoring
  skills. Two more definitions in its `resources/` folder run pages of
  the same content on a virtual cluster and with no Kubernetes access.
- `captures/custom-site/app.py` is Example Academy, a small front end of
  the kind a training team builds: it lists workshops from the lookup
  service and starts Sessions, embeds the training portal, receives the
  portal's analytics events, and runs an examiner check from outside a
  Session.

The guides' command outputs are recaptured by hand; see
[guide-outputs.md](guide-outputs.md).

## What the current captures come from

The captures in `src/content/features/` were taken on 7 and 8 October 2026 from
Educates 4.0 as built from the `develop` branch of
`jorgemoralespou/educates-training-platform` at commit `a648c25`, on a
local Kind cluster with HTTPS at `educates.test`:

| Part | Build |
| --- | --- |
| Operator, session manager, secrets manager, training portal, lookup service | images built 2 October 2026 |
| Workshop base image | built 5 October 2026 |
| educates CLI | built 20 September 2026 |
| Air-gapped install's image list | `educates-images-4.0.0-alpha.10.txt`, from the 4.0.0-alpha.10 release, in `fixtures/` |

The site's 4.0 setting, `site.educates4Released`, was off; 4.0-only
Features are captured all the same, so their visuals are ready when it
turns on. Once Educates 4.0 is released, take the captures again from the
release.

## What you need

- A local Educates cluster, from `educates create-cluster` (or
  `educates local cluster create`), with an ingress domain of its own and
  HTTPS, as the [local environment docs](https://docs.educates.dev/en/stable/getting-started/local-environment.html)
  describe. The Session's image registry needs HTTPS. The lookup service
  must be turned on. On a cluster without a domain of its own, the shots
  of the registry and the lookup service fail.
- The `educates` CLI on your `PATH`, or its path in `EDUCATES_CLI` for
  `setup` and `teardown`, and `kubectl` pointing at the cluster.
- Google Chrome. The tool looks for it at its macOS location, or at
  `CHROME_PATH`.
- ffmpeg, with libx264, and Docker.
- `tree` and Hugo, for the local authoring shots (`brew install tree hugo`).
- About 6 CPUs and 12 GiB of memory free on the cluster: up to six
  Sessions run at once, three of them with a Docker daemon.

The cluster's certificate comes from a CA of its own, so the browser the
tool starts accepts certificates it cannot verify. Only that browser does,
and only for the run.

## Taking the captures

1. Deploy the capture workshop and everything beside it:

   ```
   npm run captures -- setup
   ```

   This publishes `captures/workshop` to the cluster's registry, creates a
   training portal of its own, `site-captures`, and deploys the three
   workshop definitions to it. It registers the cluster with the lookup
   service, with a tenant and two clients, and deploys Example Academy in
   the `site-captures-example-academy` namespace. Running it again
   publishes the workshop again and updates the rest.

2. Take every shot, or only some, by shot id or Feature:

   ```
   npm run captures
   npm run captures -- examiner-checks lookup-service/request
   ```

   `npm run captures -- list` lists the shots. Each is defined in
   `manifest.ts`: the Feature entry and slot it fills, where it is taken
   (a Session's dashboard, two side by side, the portal, Example Academy,
   or a terminal on this machine), the steps that set it up, its window
   and its alt text. Shots of the same Session run in the order of the
   manifest, so a shot can rely on the steps of those before it. A shot
   taken alone gets a new Session, so take a shot that needs an earlier
   step, such as the application deployed, together with the shots
   before it: `npm run captures -- clickable-actions examiner-checks`.

   Screenshots are saved as WebP, next to their entry, such as
   `src/content/features/examiner-checks/question.webp`, at twice the
   window's size and under about 300 KB. Loops are recorded through the
   DevTools screencast, encoded as muted H.264 MP4 of 6 to 10 seconds
   under about 1 MB, with a WebP poster from their first frame. The local
   authoring shots run the `educates` CLI on this machine, in a scratch
   folder under the system's temporary folder, and show it in a terminal
   window drawn with asciinema-player.

3. Look at every capture before you commit it: nothing cropped, no
   errors, no spinners, nothing personal. Take a shot again by naming it.

4. The tool wires each capture into its Feature entry as it writes it:
   the Feature's `visual`, its deep page's `page.loop`, or a thing's
   `visual` or `loop`, with the alt text from the manifest. Check that
   every slot is filled and wired with:

   ```
   npm run captures -- check
   ```

   The unit tests run the same check, and the site check warns about any
   placeholder left.

5. Remove the portal and everything `setup` created:

   ```
   npm run captures -- teardown
   ```

   It deletes the `site-captures` portal with its Sessions, the workshop
   definitions deployed to it, the portal the branding shot creates for
   itself, Example Academy's namespace, and the lookup service resources
   and cluster-wide resources labelled
   `app.kubernetes.io/part-of=site-captures`, among them the
   `educates-config` namespace when `setup` created it. It leaves other
   portals alone. The workshop content images it published stay in the
   local registry, `localhost:5001/lab-site-captures-files` and
   `localhost:5001/lab-new-workshop-files`, as do the images the cluster
   pulled.

## Changing a shot

Change its steps in `manifest.ts`, and the instruction page it uses in
`captures/workshop/workshop/content/`. After changing the workshop, run
`setup` again so new Sessions get the new content. A shot that needs a new
slot on a Feature page starts with the entry: the manifest check fails
until every slot has exactly one shot of its kind.
