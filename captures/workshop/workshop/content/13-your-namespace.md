---
title: Your own namespace
---

Everything you deploy lives in your namespace, `{{< param session_namespace >}}`.
Deploy Bookshelf there, and list your pods:

```terminal:execute
command: |-
  echo "Namespace: $SESSION_NAMESPACE" && kubectl apply -f frontend/ && kubectl get pods
clear: true
```

Other Sessions have namespaces of their own, which you cannot see:

```terminal:execute
command: kubectl get pods --all-namespaces
```

In your namespace you are an admin, and outside it you are nobody:

```terminal:execute
command: |-
  kubectl auth can-i create deployments && kubectl auth can-i list pods --all-namespaces
session: 2
clear: true
```

The namespace has a budget, which caps what all your pods together may use:

```terminal:execute
command: kubectl describe resourcequota compute-resources object-counts
clear: true
```

Clear the terminals before you move on:

```terminal:clear-all
```
