---
slug: getting-started-on-kind
title: Getting started on KinD
authors: [jorge]
tags: [kind, getting-started, educates]
---

Educates Training Platform is very easy to install locally in order to get started. Just download the `educates` [binary for the latest release](https://github.com/educates/educates-training-platform/releases) for your operating system and architecture, and once placed wherever you put your binaries, just need to run:

```
educates create-cluster
``` 

As easy as that.
<!-- truncate -->

Educates Training Platform will be installed on your machine using [KinD (Kubernetes on Docker)](https://kind.sigs.k8s.io/) and will provide, along with the [Educates Training Platform](https://github.com/educates/educates-training-platform) itself, an Ingress Controller ([contour](https://projectcontour.io/)) and policy management ([kyverno](https://kyverno.io/)) to provide a minimal environment for you to start creating or deploying Workshops.

Head to our [Getting started documentation page](https://docs.educates.dev/en/stable/getting-started/quick-start-guide.html) for a more detailed description about the features and options.

## Asciinema

<AsciinemaPlayer src="/asciinemas/getting-started-on-kind.cast" autoPlay={true} loop={true} />