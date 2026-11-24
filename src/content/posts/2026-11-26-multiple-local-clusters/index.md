---
slug: multiple-local-clusters
title: Running Several Educates Clusters on One Laptop
description: "Educates 4.0 runs named local clusters beside the default one, each on a host IP of its own, sharing one registry, resolver and CA. Why one cluster wasn't enough, how named clusters work, and where to read more."
date: 2026-11-26
authors: [jorge]
tags: [educates, local, kind, cli, dns, v4-new]
---

Until now, the Educates CLI assumed there was exactly one local cluster on your machine. A second `educates local cluster create` failed with "cluster for Educates already exists", and there was no way around it.

We are pleased to announce that, in Educates 4.0, you can run named local clusters beside the default one. A command you run without a cluster name behaves as it always did, and a second cluster is one command away once your host has an address for it.

4.0 isn't final yet, so everything here uses the latest prerelease at the moment of writing, 4.0.0-alpha.14. Use that version or a later one: an older CLI knows only one cluster, and can delete what the others need.

## The Problem with One Local Cluster

The 3.x CLI hardcoded everything about its local cluster: the kind cluster `educates`, its node and its kube context. Pointing `EDUCATES_CLI_DATA_HOME` at a second folder didn't help either. The second cluster still wanted to be called `educates`, bind the same ports 80 and 443, and manage the same registry and resolver containers.

That is a hassle as soon as one cluster isn't enough, and when you work on Educates or on workshops for it, that happens often:

- **Comparing builds.** A branch build beside the release you are comparing it with.
- **Testing upgrades.** A fresh install beside an upgraded one.
- **Spanning clusters.** A Lookup Service that spans two clusters.
- **Working in parallel.** Several agents working on the platform at once, each on a cluster of its own.

The only way out was to tear down one cluster to create the next, or to build a kind cluster by hand and lose the registry, mirror and resolver wiring the CLI does for you.

## Named Local Clusters

In 4.0, the cluster you have always created is the default local cluster, and you can create any number of named ones beside it:

```bash
educates local cluster create --local-cluster test2 --listen-address 10.10.10.2
```

That writes the cluster's config to the data home, creates the kind cluster `educates-test2` with the kube context `kind-educates-test2`, and installs Educates in it, while the default cluster keeps running. Everything about a named cluster derives from its name, so you never have to remember which context goes with which cluster.

### One host IP per cluster

Educates builds every workshop URL on ports 80 and 443 with no port suffix, so clusters can't be told apart by port. They are told apart by address instead. Every local cluster, the default one included, declares a host IP of its own in `cluster.listenAddress`, publishes its ports 80 and 443 there, and has its domain resolve to it.

The address has to be a specific IP of your host. `0.0.0.0` claims ports 80 and 443 on every address and leaves none for a second cluster. A loopback address such as `127.0.0.2` works from your browser, but not from inside the cluster, where a pod resolving the ingress domain would reach itself instead of your host.

The CLI never runs `sudo`, so adding the address to a network interface is a one-time step that is yours to take. On macOS, the [fixed IP post](/blog/fixed-ip-bridge-macos) gives your machine a `bridge1` interface at `10.10.10.1`, and every further cluster gets an alias on the same bridge. The CLI checks that the address is really there before it creates a cluster, and refuses an address or a domain that another cluster, running or stopped, already uses.

If you use Docker Desktop 4.97 or later, there is one more setting: turn on **Settings > Advanced > Allow privileged port forwarding to external machines**. Without it, Docker Desktop serves ports below 1024 on loopback only, and no local cluster is reachable from your browser, the default one included.

### Picking the cluster you mean

You select a cluster per command with `--local-cluster`, or per terminal with the `EDUCATES_LOCAL_CLUSTER` environment variable. It works like `kubectl --context` and `KUBECONFIG`, minus a stored current context: the CLI never remembers a selection, so one terminal can work on `test2` while another works on the default cluster, and neither follows the other. With a cluster selected, the `educates cluster` and `educates admin` commands use its kube context, whatever context kind last made current.

`educates local cluster list` shows every local cluster, running or stopped:

```
NAME        STATE     NODES   KUBERNETES   LISTEN IP    DOMAIN              CONTEXT
(default)   running   1       v1.36.4      10.10.10.1   educates.test       kind-educates
test2       stopped   3       -            10.10.10.2   10-10-10-2.nip.io   kind-educates-test2
```

### What every cluster shares

Each cluster has its own address, config and kube context, but some things are the same for all of them, so there is only one of each:

- **One registry.** `localhost:5001` serves every cluster, so a workshop you publish once can be deployed to all of them.
- **One set of registry mirrors.** Mirrors are declared once for the whole machine, and linked into every node of every cluster.
- **One DNS resolver.** It serves every cluster's domain at that cluster's address. A cluster on `test2.educates.test` gets its own name, while every other name under `educates.test` still reaches the default cluster.
- **One root CA.** You trust it once, and every cluster's domain gets an intermediate CA minted from it, so a named cluster can serve HTTPS with nothing new to trust.

A named cluster with no domain uses the nip.io name of its address over plain HTTP, so it needs no CA and no resolver entry at all.

Deleting a named cluster keeps its config, so creating it again brings it back as it was. And `delete --all` removes the shared registry, mirrors and resolver only with the last local cluster, never while another one still needs them.

### Upgrading from a single cluster

Your first 4.0 command migrates your 3.x config and tells you what it changed. Two of those changes need you to act:

- **A cluster on `0.0.0.0` blocks every new one.** The migration sets the listen address to your host's IP, but kind fixes the binding when it creates a cluster, so re-create the default cluster on a stable address before you add a second.
- **The resolver sync LaunchAgent has nothing left to do.** With a stable address per cluster, the agent from the [resolver sync post](/blog/sync-resolver-macos) is no longer needed, so unload it.

## Conclusions

One local cluster was enough until it wasn't, and the workarounds cost you the very wiring that makes local clusters handy. Give each cluster an address of its own, name the ones beside the default, and select the one you mean per terminal. That is the recommended way to run more than one Educates cluster on your laptop, because every cluster gets the same registry, mirrors, resolver and CA without any of them stepping on the others.

The [running several local clusters](https://docs.educates.dev/en/latest/getting-started/local-environment.html#running-several-local-clusters) section of the local environment docs covers adding host addresses on macOS and Linux, selecting clusters, serving one workshop to several clusters, and cleaning up. The [migration guide](https://docs.educates.dev/en/latest/installation-guides/migrating-from-v3.html) covers the rest of the move from 3.x.

In the next post, we'll give a local cluster more than one node, with the labels and taints of a production node pool: [Multi-Node Local Clusters](/blog/multi-node-local-clusters).
