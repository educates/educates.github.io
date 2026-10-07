---
title: Creating an Educates cluster
description: Create a local Kind cluster with Educates installed, in one command.
order: 4
---

With Docker, kubectl and the Educates CLI installed, one command creates
your local Educates environment. It needs ports 80, 443 and 5001 free on
your machine, and no other Kind cluster running.

```sh title="Create the local Educates cluster"
educates create-cluster
```

This will do the following, in sequence:

1. Create a Kind configuration made for Educates, save it on your machine,
   and create a local Kubernetes cluster from it.
2. Set the context of `kubectl` to the new cluster, `kind-educates`.
3. Deploy a local image registry on `localhost:5001`, for the workshops and
   images you publish, and configure the cluster's nodes to use it.
4. Install [Kyverno](https://kyverno.io), the security policy engine.
5. Install [Contour](https://projectcontour.io/), the ingress controller,
   and expose it on ports 80 and 443 of your machine.
6. Deploy Educates.

The output of this command will look like this:

```text title="Installation progress"
Cluster config used is saved to:  /Users/you/Library/Application Support/educates/educates-cluster-config.yaml
Creating cluster "educates" ...
 ✓ Ensuring node image (kindest/node:v1.36.1) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
 ✓ Waiting ≤ 1m0s for control-plane = Ready ⏳
 • Ready after 14s 💚
Set kubectl context to "kind-educates"
You can now use your cluster with:

kubectl cluster-info --context kind-educates --kubeconfig /Users/you/.kube/config

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
Deploying local image registry
Linking local image registry to cluster
Adding local image registry config (localhost:5001) to Kind nodes
Adding local image registry config (registry.default.svc.cluster.local) to Kind nodes
9:15:15AM: ---- applying 7 changes [0/137 done] ----
[...]
9:17:41AM: ---- applying complete [137/137 done] ----
9:17:41AM: ---- waiting complete [137/137 done] ----
Educates cluster has been created succesfully
```

**This command might take several minutes to spin up the cluster, download all the needed
container images, and bootstrap the environment. Enough time to get some coffee! ☕**
