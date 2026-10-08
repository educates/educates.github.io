---
title: Deploy the Application
---

A deployment describes the application you want running. Open it in the
editor:

```editor:open-file
file: ~/exercises/deployment.yaml
```

The container section names the image and the port it listens on:

```editor:select-matching-text
file: ~/exercises/deployment.yaml
text: "containers:"
after: 4
```

Apply the deployment to your namespace:

```terminal:execute
command: kubectl apply -f deployment.yaml
```

Watch its pod start in the second terminal:

```terminal:execute
command: kubectl get pods --watch
session: 2
```

When the pod shows `Running`, stop watching:

```terminal:interrupt
session: 2
```

Check that the deployment is ready:

```examiner:execute-test
name: test-deployment-ready
title: Verify the bookshelf deployment is ready
args:
- bookshelf
```
