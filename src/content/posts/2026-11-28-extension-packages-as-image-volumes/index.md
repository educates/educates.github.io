---
slug: extension-packages-as-image-volumes
title: Extension Packages, Now as Image Volumes
description: "Educates 4.0 publishes an extension package as a multi-arch image and mounts it read only into each workshop session where the cluster supports Kubernetes image volumes, fetching it everywhere else. Why we changed it, how the two modes work, and how to create a package image."
date: 2026-11-28
authors: [jorge]
tags: [educates, announcement, authoring, workshops, kubernetes, v4-new]
---

Every session of a workshop that used the argocd extension package downloaded it as the session started. The session pulled a 140 MB layer from the registry, unpacked it into its own volume and repaired its file permissions, and half of those bytes were the binary for the other CPU architecture. The next session did it all again.

We are pleased to announce that, in Educates 4.0, an extension package can be published as an image of its own and declared in a workshop by reference. Where the cluster supports Kubernetes image volumes, the package is mounted straight into the session, and where it doesn't, the same image is fetched instead. The workshop definition is the same either way.

4.0 isn't final yet, so everything here uses the latest prerelease at the moment of writing, 4.0.0-alpha.14.

## The Problem with Downloading Packages per Session

An extension package is a directory of tools and hooks that the workshop base image picks up from `/opt/packages/<name>`: binaries added to `PATH`, setup scripts run when the session starts, background services and examiner tests. It lets many workshops share a CLI or a VS Code extension without each one building a custom workshop image that has to be rebuilt for every Educates release. We maintain a set of them in [educates-extension-packages](https://github.com/educates/educates-extension-packages), and [Educates Hub](/blog/announcing-educates-hub) lists them.

Until 4.0, a package could only be delivered as a list of vendir sources under `files`, and every session ran `vendir sync` when it started. That worked, but it cost more than it looked:

- **Every session downloaded every package, every time.** Nothing was shared between sessions, not even between sessions on the same node.
- **Packages carried every architecture.** The argocd package downloads both `argocd-linux-amd64` and `argocd-linux-arm64`, and its setup script renames the one that matches the session.
- **Packages had to repair themselves.** vendir doesn't preserve file modes, so a startup script ran `chmod` across the tree to put the execute bits back.
- **Nothing checked what arrived.** A wrong image reference unpacked happily, and the session started without the tools it was meant to have.

## Extension Packages as Images

In 4.0, a package can be published as a real multi-arch OCI image whose filesystem is the package, and a workshop declares it with one line:

```yaml
spec:
  workshop:
    packages:
    - name: argocd
      image: ghcr.io/myorg/argocd:2.10.6
```

`ghcr.io/myorg` stands for wherever you publish the package. That image solves each of the problems above:

- **One architecture per session.** The image holds one variant per architecture, and a session receives only the one it runs.
- **Modes as published.** The files arrive with the permissions they were published with, so there is nothing to repair.
- **A package that didn't arrive fails visibly.** Every package image carries a `package.yaml` manifest, and the session checks for it before any setup script runs. A missing manifest shows an error in the dashboard, instead of leaving the session quietly without its tools.

`image` is the preferred form for a published package. `files` remains the way to bring in a package from a Git repository or a web server, and to work on a package locally. The [workshop definition reference](https://docs.educates.dev/en/latest/custom-resources/workshop-definition.html#declaring-an-extension-package-as-an-image) covers the rules for the reference, which takes a tag and not a digest, and how to pull from a private registry.

One thing to keep in mind: the packages in `educates-extension-packages` haven't been republished as package images yet. Keep declaring those with `files` until [#6](https://github.com/educates/educates-extension-packages/issues/6) lands.

## Two Modes: Image Mount and Fetch

A workshop has to run unchanged on any cluster, and not every cluster can mount an image as a volume. So you declare the package, and the platform decides how to deliver it:

- **Image mount.** The kubelet pulls the package like any container image, picks the node's architecture and mounts the image read only at `/opt/packages/<name>`. Nothing in the session downloads anything, and every session on a node shares the one copy the node pulled.
- **Fetch.** A small fetcher in the workshop base image pulls the same image when the session starts, picks the session's architecture and unpacks it into `/opt/packages/<name>`, with the published modes intact.

Either way the package lands at the same path, with the same files, and the same hooks run. The one difference you can see is that a mounted package is read only. That is why every package has to treat itself as read only, writing anything it generates under `$HOME`: a package that writes into itself works when fetched, and breaks the first time it lands on a cluster that mounts.

The choice is a platform setting, `spec.packageDelivery.imageMount` on the `EducatesClusterConfig` resource that the [operator post](/blog/educates-4-operator-and-crds) introduces. Its default, `Auto`, mounts when the whole cluster can: a Kubernetes API server of 1.36 or newer, and on every Linux node a kubelet of 1.35 or newer with containerd 2.1 or CRI-O 1.31 or newer. Those thresholds follow the image volume feature upstream, which is [stable from Kubernetes 1.36](https://kubernetes.io/docs/reference/storage/volume-types/). One node short of the mark turns the whole cluster to fetch, since a session could land on it. `Enabled` and `Disabled` force one mode or the other.

A local cluster created by the 4.0 CLI runs Kubernetes 1.36, so it mounts with no configuration. A workshop deployed with `educates docker workshop deploy` makes the same choice against your Docker daemon, and mounts on Docker Engine 28.0 or newer using the containerd image store, which a current Docker Desktop meets. In every session, `download-workshop.log` records which mode each package arrived by.

The [configuration settings](https://docs.educates.dev/en/latest/installation-guides/configuration-settings.html#delivery-of-extension-packages) cover the setting in full: how to read why the operator chose a mode, and when a change takes effect.

## Creating an Extension Package Image

A package source is a directory with a `package.yaml` manifest beside up to three reserved directories: `common` for what every architecture shares, and `linux-amd64` and `linux-arm64` for what each architecture needs. This is the greeter package from the [`lab-extension-packages`](https://github.com/educates/educates-training-platform/tree/develop/workshop-samples/lab-extension-packages) sample:

```text
packages/greeter/
  package.yaml
  common/
    setup.d/01-greeter.sh
  linux-amd64/bin/greeter
  linux-arm64/bin/greeter
```

The `educates` CLI turns it into a package image and pushes it:

```bash
educates package publish packages/greeter
```

The publish builds one image per architecture, each with `common` and its own platform directory flattened into its root, and wraps them in a multi-arch index. It needs no Docker daemon, and it is reproducible: the same source and the same CLI give the same digests, run after run. With no `--image-repository`, the image goes to the `localhost:5001` registry that [every local cluster shares](/blog/multiple-local-clusters), ready for a workshop to declare it as `$(image_repository)/greeter:1.0.0`. In a pipeline, `--image-repository` and `--image-tag` point it at your own registry, and `--digest-file` records the digest for a later step.

If the files in your package have to be built for each architecture, a multi-stage Dockerfile ending in `FROM scratch`, built with `docker buildx`, works too. What makes an image a package is the `package.yaml` at its root, not the tool that built it.

The [creating extension packages](https://docs.educates.dev/en/latest/workshop-content/creating-extension-packages.html) guide covers the source layout, the manifest, the read-only rule, publishing from a pipeline and the [Dockerfile route](https://docs.educates.dev/en/latest/workshop-content/creating-extension-packages.html#building-a-package-image-with-a-dockerfile) in detail.

## Conclusions

Extension packages are how workshops share tools on Educates, and in 4.0 they get cheaper to deliver and safer to run. Publish your packages as images, declare them by tag, and leave the delivery to the platform. That is the recommended way to ship tools to your workshops on Educates 4.0, because the same definition mounts the package on a current cluster, fetches it everywhere else, and tells you when a package didn't arrive.

Next, we are republishing the packages we maintain as package images, so that argocd, vcluster and the rest can be declared by image too. In the meantime, the greeter sample is the quickest way to see a package image at work on a local cluster. The full change is in [PR #1202](https://github.com/educates/educates-training-platform/pull/1202).
