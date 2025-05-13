---
sidebar_label: Create an Educates Cluster
sidebar_position: 5
---
# Creating an Educates Cluster

Once we got our prerequisites - Docker Desktop and Educates - installed  we can proceed
with creating our Educates environment by issuing a single bootstrapping command:

```sh
educates create-cluster
```

This will do the following, in sequence:

1. Create a purposefully crafted KinD configuration and save it to your local system.
2. Create a local Kubernetes cluster using KinD and the configuration created in step 1.
3. Set the context of `kubectl` to the created cluster.
4. Create a local image registry to publish workshop images and resources to on `localhost:5001`
5. Configure KinD cluster nodes to use the created registry on a node and cluster level.
6. Deploy the Educates framework to the cluster using [`kapp`](https://carvel.dev/kapp/).

The output of this command will look like this - see the annotations for references to each of the
outlined steps.

```{ .sh .no-copy title="Installation progress" }
Cluster config used is saved to:
~/Library/Application Support/educates/educates-cluster-config.yaml
Creating cluster "educates" ...
✓ Ensuring node image (kindest/node:v1.30.0) 🖼
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
