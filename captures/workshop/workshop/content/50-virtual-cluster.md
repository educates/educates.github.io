---
title: A cluster of your own
---

Your Session has a virtual cluster of its own, where you are cluster admin.
It has nodes and namespaces like any other cluster:

```terminal:execute
command: kubectl get nodes && kubectl get namespaces
clear: true
```

You can do anything a cluster admin can:

```terminal:execute
command: kubectl auth can-i '*' '*' --all-namespaces
```

Such as create a namespace, and add a custom resource type of your own:

```terminal:execute
command: |-
  kubectl create namespace operators && kubectl apply -f vcluster/books-crd.yaml && kubectl get crds
session: 2
clear: true
```
