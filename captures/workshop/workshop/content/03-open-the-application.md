---
title: Open the application
---

Bookshelf is running. Open it in a tab of its own beside the instructions:

```dashboard:create-dashboard
name: Bookshelf
url: "{{< param ingress_protocol >}}://frontend-{{< param session_hostname >}}/"
```

Each time you reload it, a different pod may answer:

```dashboard:reload-dashboard
name: Bookshelf
```

See the deployment and its pods in the Kubernetes console:

```dashboard:open-dashboard
name: Console
```

Or open the application in a new browser tab:

```dashboard:open-url
url: "{{< param ingress_protocol >}}://frontend-{{< param session_hostname >}}/"
```

When you are done with it, close the tab:

```dashboard:delete-dashboard
name: Bookshelf
```
