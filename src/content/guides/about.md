---
title: What you just installed
description: The pods, policies and resources a local Educates install gives you, and the commands to see them.
order: 2
tags: [getting-started, kubernetes, local]
---

`educates create-cluster` gave you more than a Kind cluster. Before you
write a workshop, take a few minutes to look at what runs in it: the
workloads Educates installed, the security policies that fence in workshop
users, and the custom resources you drive Educates with. The CLI set
`kubectl` to the cluster's `kind-educates` context, so every command here
runs from your own terminal.

## The workloads

List every pod in the cluster with its namespace:

```sh title="List every pod in the cluster"
kubectl get pods --all-namespaces -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name
```

The output looks like this, with different random suffixes:

```text title="Output"
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
kyverno              kyverno-cleanup-controller-5d44984995-dghtb
kyverno              kyverno-reports-controller-7b4c74c6c5-k7gkk
local-path-storage   local-path-provisioner-988d74bc-gt7xr
projectcontour       contour-7fb9b8fd87-9w4mc
projectcontour       contour-certgen-v1-30-2-d9hqt
projectcontour       envoy-2fzc7
```

`kube-system` and `local-path-storage` hold Kubernetes' and Kind's own
workloads. The other three namespaces are what Educates needs: Educates
itself, Kyverno and Contour.

### Educates

Three workloads run in the `educates` namespace:

- **session-manager** is the Educates operator. It deploys a training
  portal for each `TrainingPortal` resource, and sets up the workshop
  environments and Sessions the portal asks for: their namespaces, pods,
  access rules and ingresses.
- **secrets-manager** copies secrets between namespaces, and adds image
  pull secrets to service accounts, as its own resources describe. The
  session manager uses it too, for example to copy the ingress TLS
  certificate into the namespace of each workshop environment.
- **image-puller** runs on every node and pulls the training portal image,
  and any workshop images Educates is set to pre-pull, ahead of time, so
  portals and Sessions start faster.

When you deploy your first workshop in the next part, more pods appear: the
training portal, then a pod for each Session.

### Kyverno

[Kyverno](https://kyverno.io) is the policy engine. Workshop users get
access to a Kubernetes cluster, and they are not always people you trust,
so Educates installs policies that Kyverno enforces on every request to the
Kubernetes API: no privileged containers, no host namespaces or paths, no
privilege escalation, and more. Together with the access rules and quotas
of each Session, they keep a user from harming the cluster or another
user's Session.

List the policies Educates installed:

```sh title="List the Kyverno cluster policies"
kubectl get clusterpolicies
```

There are quite a few:

```text title="Output"
NAME                                                ADMISSION   BACKGROUND   READY   AGE   MESSAGE
educates-baseline-disallow-capabilities             true        true         True    22h   Ready
educates-baseline-disallow-host-namespaces          true        true         True    22h   Ready
educates-baseline-disallow-host-path                true        true         True    22h   Ready
educates-baseline-disallow-host-ports               true        true         True    22h   Ready
educates-baseline-disallow-host-ports-range         true        true         True    22h   Ready
educates-baseline-disallow-host-process             true        true         True    22h   Ready
educates-baseline-disallow-privileged-containers    true        true         True    22h   Ready
educates-baseline-disallow-proc-mount               true        true         True    22h   Ready
educates-baseline-disallow-selinux                  true        true         True    22h   Ready
educates-baseline-restrict-seccomp                  true        true         True    22h   Ready
educates-baseline-restrict-sysctls                  true        true         True    22h   Ready
educates-restricted-disallow-capabilities-strict    true        true         True    22h   Ready
educates-restricted-disallow-privilege-escalation   true        true         True    22h   Ready
educates-restricted-require-run-as-non-root-user    true        true         True    22h   Ready
educates-restricted-require-run-as-nonroot          true        true         True    22h   Ready
educates-restricted-restrict-volume-types           true        true         True    22h   Ready
```

The docs explain why Educates uses Kyverno rather than Kubernetes' own pod
security standards, in
[Cluster requirements](https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html).

### Contour

[Contour](https://projectcontour.io/) is the ingress controller, built on
the [Envoy](https://www.envoyproxy.io/) proxy, and the CLI exposed it on
ports 80 and 443 of your machine. Educates creates an `Ingress` for each
training portal and Session, and Contour routes your browser to them. On
this local cluster their host names end in a [nip.io](https://nip.io)
domain made from your machine's IP address, such as `192-168-1-1.nip.io`,
which always resolves back to your machine.

## The custom resources

Educates extends the Kubernetes API with its own resource types, and you
work with Educates by creating and changing resources of those types. List
them:

```sh title="List the Educates custom resource definitions"
kubectl get crds -o custom-columns=NAME:.metadata.name | grep educates
```

A local install has ten, in two API groups:

```text title="Output"
secretcopiers.secrets.educates.dev
secretexporters.secrets.educates.dev
secretimporters.secrets.educates.dev
secretinjectors.secrets.educates.dev
trainingportals.training.educates.dev
workshopallocations.training.educates.dev
workshopenvironments.training.educates.dev
workshoprequests.training.educates.dev
workshops.training.educates.dev
workshopsessions.training.educates.dev
```

The resources in `secrets.educates.dev` are the secrets manager's. Those in
`training.educates.dev` are the session manager's, and two of them are the
ones you write:

- **`Workshop`** defines a workshop: where its content comes from, the
  applications each Session gets, such as the terminal, editor and
  Kubernetes console, and the resources and access each Session has. In
  the next part, the CLI generates one for you in `resources/workshop.yaml`.
  Reference:
  [Workshop definition](https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html).
- **`TrainingPortal`** deploys a training portal, the web site where people
  pick a workshop and get their own Session. It lists the workshops it
  serves, how many Sessions each can run, and how people get in. The first
  time you deploy a workshop, the CLI creates one named `educates-cli`.
  Reference:
  [Training portal](https://docs.educates.dev/en/stable/custom-resources/training-portal.html).

The training portal creates the rest for you: a `WorkshopEnvironment` for
each workshop it serves, and a `WorkshopSession` for each Session. The docs
call them internal resources you do not need to touch. Once you have
deployed a workshop, see them all with:

```sh title="List the Educates training resources"
kubectl get workshops,trainingportals,workshopenvironments,workshopsessions
```

If you share secrets with your workshops, such as registry credentials, the
[Secret copier](https://docs.educates.dev/en/stable/custom-resources/secret-copier.html)
reference is the place to start.
