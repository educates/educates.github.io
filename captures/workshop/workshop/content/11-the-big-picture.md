---
title: The big picture
---

The slides for this step show how the pieces fit together:

```dashboard:open-dashboard
name: Slides
```

A deployment keeps the pods you asked for running, and the service in front
of them spreads the requests:

```terminal:execute
command: kubectl get deployment,replicaset,pods,service -l app=frontend
```
