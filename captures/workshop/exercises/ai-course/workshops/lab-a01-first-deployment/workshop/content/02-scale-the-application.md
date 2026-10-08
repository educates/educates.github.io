---
title: Scale the Application
---

One replica is not much. Ask for three:

```editor:set-yaml-value
file: ~/exercises/deployment.yaml
path: spec.replicas
value: 3
```

Apply the change:

```terminal:execute
command: kubectl apply -f deployment.yaml && kubectl get pods
```

Delete one pod, and watch Kubernetes replace it:

```terminal:execute
command: kubectl delete pod -l app=bookshelf --wait=false | head -1 && kubectl get pods
```
