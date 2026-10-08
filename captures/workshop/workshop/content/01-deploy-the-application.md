---
title: Deploy the application
---

Bookshelf is two replicas of a web server, with its page and its settings
in config maps. The manifests are in `~/exercises/frontend`.

Apply them to your namespace:

```terminal:execute
command: kubectl apply -f frontend/
event: bookshelf-deployed
```

Watch the pods start in the second terminal:

```terminal:execute
command: kubectl get pods --watch
session: 2
```

Once both pods show `Running`, stop watching:

```terminal:interrupt
session: 2
```

Then list what you created, in every terminal at once:

```terminal:execute-all
command: kubectl get deployments,pods
clear: true
```
