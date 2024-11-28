---
sidebar_position: 1
---
# Setup Educates

As [Educates](https://educates.dev) is powered by [Kubernetes](https://kubernetes.io), we will
need a way to run a cluster locally - luckily, the Educates CLI wraps [KinD](https://kind.sigs.k8s.io/)
and can do the heavy-lifting for us.

However, for this setup to work, we will need a **container runtime**. Our choice will be
[Docker Desktop](https://www.docker.com/products/docker-desktop/), which is also the recommended runtime from KinD's/Educates' perspective.

We will also install [`kubectl`](https://kubernetes.io/docs/reference/kubectl/), the official Kubernetes
CLI, in order to interact with our cluster in a more fine-grained way than is possible with the Educates
CLI.
