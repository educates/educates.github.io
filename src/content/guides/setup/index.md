---
title: Set up
description: Install Docker, kubectl and the Educates CLI, and create a local Educates cluster.
order: 1
tags: [getting-started, local, kind, cli]
---

Educates runs on [Kubernetes](https://kubernetes.io), so to try it on your
machine you need a local cluster. You don't have to build one: the Educates
CLI creates a [Kind](https://kind.sigs.k8s.io/) cluster with Educates
installed, in one command. Kind runs the cluster's nodes as containers, so
you need a **container runtime** first. These guides use
[Docker Desktop](https://www.docker.com/products/docker-desktop/), the
runtime the Educates CLI has been tested with most.

You will also install [`kubectl`](https://kubernetes.io/docs/reference/kubectl/),
the Kubernetes CLI, to look inside the cluster in more detail than the
Educates CLI shows.

The Educates CLI runs on **macOS and Linux**. On Windows, work inside WSL,
the Windows Subsystem for Linux, and follow the Linux instructions
throughout.
