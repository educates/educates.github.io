---
sidebar_position: 2
---
# Educates Components

Educates is a complex platform, handling **workshop creation, user sessions, runtime security**, and
many more things for us. This of course means that additional tooling is required, which has already
been installed when bootstrapping the platform.

Let's take a first look.

## Overview

We can display all the workloads deployed to our cluster using `kubectl`:

```sh title="Listing all Pods in our cluster"
k get pods -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name -A
```

The output presents itself similar to this - the workloads deployed as part of the
Educates platform are highlighted:

```
NAMESPACE            NAME
educates             image-puller-4qzph
educates             secrets-manager-5f78fb8599-kkkw8
educates             session-manager-5d86cdf4cb-h2flm
kube-system          coredns-7db6d8ff4d-4rf8f
kube-system          coredns-7db6d8ff4d-tb9tx
kube-system          etcd-educates-control-plane
kube-system          kindnet-7g59l
kube-system          kube-apiserver-educates-control-plane
kube-system          kube-controller-manager-educates-control-plane
kube-system          kube-proxy-rpwb8
kube-system          kube-scheduler-educates-control-plane
kyverno              kyverno-admission-controller-d49646b75-6qhf2
kyverno              kyverno-background-controller-6f9b5b9d57-ljm66
kyverno              kyverno-cleanup-admission-reports-28816380-zt8b2
kyverno              kyverno-cleanup-cluster-admission-reports-28816380-cf5m9
kyverno              kyverno-cleanup-controller-5d44984995-dghtb
kyverno              kyverno-reports-controller-7b4c74c6c5-k7gkk
local-path-storage   local-path-provisioner-988d74bc-gt7xr
projectcontour       contour-7fb9b8fd87-9w4mc
projectcontour       contour-certgen-v1-28-5-d9hqt
projectcontour       envoy-2fzc7
```

On first glance, we can spot three major components: **Educates** itself, **Kyverno**,
and **Contour**.

## Educates

For now, we see three workloads deployed to the `educates` namespace: an **image-puller**,
a **secrets-manager**, and a **sessions-manager**.

Each of them serves a specific purpose, which can be derived from their names:

- **image-puller**: This workload **prefetches** images needed for the workshops once they
  are created into the cluster: the workshop environment, the web platform, etc.
- **secrets-manager**: This workload **copies** secrets needed within workshop environments
  upon their creation; this can be **session secrets** as well as information needed for specific
  workshops, e.g. **registry credentials**
- **sessions-manager**: This workload creates and manages the workshop sessions created by/for users

As we deploy our first workshop later on, we will see additional workloads being spun up as part
of the Educates platform.

## Kyverno

[Kyverno](https://kyverno.io) offers _Kubernetes Native Policy Management_ and is used by Educates to
**properly sandbox** workshop sessions from the cluster and each other.

With a set of **predefined policies** Educates ensures that workshop users can't escalate
their privileges, disturb other users' sessions, or harm the cluster in any other way.

It does so by deploying an **admission controller** that intercepts each request towards the Kubernetes API
before it gets acted upon and checks it against the configured policies.
Other deployed parts are tasked with cleaning up and reporting on admissions and other
Kyverno-related things.

We can list all `Policies` and `ClusterPolicies` deployed by Educates like this:

```sh title="Display all Kyverno policies"
kubectl clusterpolicies
```

There are quite a few of them:

``` { .text .no-copy title="List of configured Kyverno policies" }
kubectl get clusterpolicies

NAME                                                ADMISSION   BACKGROUND   VALIDATE ACTION   READY   AGE   MESSAGE
educates-baseline-disallow-capabilities             true        true         Enforce           True    22h   Ready
educates-baseline-disallow-host-namespaces          true        true         Enforce           True    22h   Ready
educates-baseline-disallow-host-path                true        true         Enforce           True    22h   Ready
educates-baseline-disallow-host-ports               true        true         Enforce           True    22h   Ready
educates-baseline-disallow-host-ports-range         true        true         Enforce           True    22h   Ready
educates-baseline-disallow-host-process             true        true         Enforce           True    22h   Ready
educates-baseline-disallow-privileged-containers    true        true         Enforce           True    22h   Ready
educates-baseline-disallow-proc-mount               true        true         Enforce           True    22h   Ready
educates-baseline-disallow-selinux                  true        true         Enforce           True    22h   Ready
educates-baseline-restrict-apparmor-profiles        true        true         Enforce           True    22h   Ready
educates-baseline-restrict-seccomp                  true        true         Enforce           True    22h   Ready
educates-baseline-restrict-sysctls                  true        true         Enforce           True    22h   Ready
educates-restricted-disallow-capabilities-strict    true        true         Enforce           True    22h   Ready
educates-restricted-disallow-privilege-escalation   true        true         Enforce           True    22h   Ready
educates-restricted-require-run-as-non-root-user    true        true         Enforce           True    22h   Ready
educates-restricted-require-run-as-nonroot          true        true         Enforce           True    22h   Ready
educates-restricted-restrict-volume-types           true        true         Enforce           True    22h   Ready
```

## Contour

[Contour](https://projectcontour.io/) is a _High performance ingress controller for Kubernetes_, used for
routing traffic from the outside of our cluster to the right workloads, e.g. **workshop sessions**.
It is based on the [Envoy](https://www.envoyproxy.io/) proxy, and allows for fine-grained and
extensive configuration.

Upon creation of workshop sessions, Educates will automatically create matching `Ingress` resources to
route traffic to the sessions based the on global platform configuration. For our local environment, the
`Ingress` resources will have [nip.io](https://nip.io) subdomains that always resolve to your own machine.
