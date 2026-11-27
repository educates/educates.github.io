---
slug: multi-node-local-clusters
title: "Multi-Node Local Clusters: Test Scheduling on Your Laptop"
description: "Educates 4.0 local clusters can run several kind nodes with the labels and taints you declare, so a laptop cluster can model the node pools of a production one. Why one node wasn't enough, how to declare the nodes, and where Educates places itself."
date: 2026-11-27
authors: [jorge]
tags: [educates, local, kind, kubernetes, authoring, v4-new]
---

Every Educates local cluster has always been a single node. That is fine for running workshops, but not for testing infrastructure that depends on several nodes, or for writing a workshop that teaches how Kubernetes schedules across them.

We are pleased to announce that, in Educates 4.0, a local cluster can have several nodes, each with the Kubernetes labels and taints you declare, so a laptop cluster can model the node pools of a production one.

4.0 isn't final yet, so everything here uses the latest prerelease at the moment of writing, 4.0.0-alpha.15.

## The Problem with a Single-Node Local Cluster

The 3.x CLI renders a kind config with exactly one node, the control plane, and kind removes the control-plane taint from a cluster of one node so that everything can run there. That leaves a lot you can't try locally:

- **Node pools.** A general pool beside a tainted special-purpose one, the shape most production clusters have.
- **Scheduling exercises.** A workshop on taints, tolerations or node affinity needs nodes that differ, and a single node can't differ from anything.
- **Placement.** Where Educates' own components, DaemonSets and workshop sessions land once there is more than one node to choose from.

The only way out was a kind cluster you built by hand. kind supports several nodes, but a hand-built cluster comes without the registry, mirror and resolver wiring the CLI does for you, so you trade one problem for another.

## Declaring the Nodes

In 4.0, the `EducatesLocalConfig` takes a `cluster.nodes` list. This one declares a control plane, a general worker, and a worker reserved for a batch pool that only workloads tolerating its taint may use:

```yaml
cluster:
  nodes:
    - role: control-plane
    - role: worker
      labels:
        pool: general
    - role: worker
      labels:
        pool: batch
      taints:
        - key: dedicated
          value: batch
          effect: NoSchedule
```

Each node has a `role`, either `control-plane` or `worker`, optional `labels` and optional `taints`. Write it with `educates local config edit`, and `educates local cluster create` does the rest: kind creates the three node containers, and the CLI links the local registry and every registry mirror into each node before it installs Educates. Stopping and starting the cluster stops and starts every node.

A few rules keep it simple:

- **Leaving `cluster.nodes` out keeps one node**, the single control-plane cluster of 3.x.
- **Exactly one node is the control plane.** It's the node the [shared router](/blog/multiple-local-clusters#one-router-for-every-cluster) sends the cluster's names to, where Envoy serves ports 80 and 443. The CLI refuses a list with none or with more than one.
- **Taints apply to workers.** Labels apply to every node.
- **Every node runs the same Kubernetes version.** `--kubernetes-version` picks it, from 1.34 to 1.37, defaulting to 1.36.

[Named local clusters](/blog/multiple-local-clusters) take their nodes the same way, in their own config, so you can run a single-node cluster and a multi-node one side by side.

### Three fields, not a kind config

The surface is narrow on purpose: three fields per node, not a raw kind config. The CLI renders them into the kind config you would otherwise write by hand, labels as the kubelet's `node-labels` and taints as its `register-with-taints`, as kind's [configuration guide](https://kind.sigs.k8s.io/docs/user/configuration/#nodes) describes. What Educates depends on stays under the CLI's control: the control plane's `ingress-ready` label, and the containerd configuration that points every node at the local registry and mirrors. No node maps a host port, since the router reaches the control plane over Docker's `kind` network by its container name.

The cost is that nothing else of kind is reachable from `cluster.nodes`: no per-node images, no mounts on workers, no feature gates or API server flags.

### Where Educates puts itself

Educates doesn't pick nodes for its own components. Where each one lands follows from tolerations alone: kind keeps the control-plane taint once a cluster has workers, and almost nothing Educates installs tolerates a taint. The Envoy ingress runs on the control plane, where the router sends ports 80 and 443, and on untainted workers. The operator, the session manager, training portals and every workshop session run on untainted workers.

On the cluster above, that puts all of them on the general worker, and leaves the batch worker free for whatever your workshop schedules there. `educates local cluster status` shows each node with the labels and taints you declared, so you can check the shape before you build on it:

```
NODE                     ROLE            STATUS   VERSION   LABELS               TAINTS
educates-control-plane   control-plane   Ready    v1.36.4   ingress-ready=true   node-role.kubernetes.io/control-plane:NoSchedule
educates-worker          worker          Ready    v1.36.4   pool=general         -
educates-worker2         worker          Ready    v1.36.4   pool=batch           dedicated=batch:NoSchedule
```

## Conclusions

A production cluster is rarely a single node, and the workshops and infrastructure you test locally shouldn't have to pretend it is. Declare the nodes your cluster needs in `cluster.nodes`, and let the CLI keep the wiring that Educates depends on. That is the recommended way to model node pools on your laptop, because you get the shape of a production cluster with the same registry, mirrors and resolver as every other local cluster.

`educates local config explain cluster.nodes` describes every field, the [checking the cluster](https://docs.educates.dev/en/latest/getting-started/local-environment.html#checking-the-cluster) section of the local environment docs covers `educates local cluster status`, and the [4.0.0 release notes](https://docs.educates.dev/en/latest/release-notes/version-4.0.0.html) list the rest.

In the next post, we'll look at a change that matters more as clusters grow: [extension packages delivered as image volumes](/blog/extension-packages-as-image-volumes), which a cluster that can mount them pulls once per node instead of once per session.
