---
title: At your own pace
---

This page lists the pods as soon as it opens:

```terminal:execute
command: kubectl get pods
autostart: true
```

```section:begin
name: scale
title: Scale the application, then check it
cascade: true
```

Opening this section scales Bookshelf, then waits for the rollout:

```terminal:execute
command: kubectl scale deployment/frontend --replicas=3
cascade: true
```

```terminal:execute
command: kubectl rollout status deployment/frontend
cascade: true
```

```section:end
name: scale
toggle: false
```

```section:begin
name: question
prefix: Question
title: Why does each reload show a different pod?
```

The service spreads requests over every ready pod of the deployment, so
consecutive requests can reach different pods.

```section:end
name: question
```

```section:begin
name: optional
prefix: Optional
title: Look inside a pod
```

```terminal:execute
command: kubectl exec deploy/frontend -- nginx -v
```

```section:end
name: optional
```
