---
title: Workshop overview
---

In this workshop you deploy Bookshelf, a small web application, to a
Kubernetes namespace of your own and check each step as you go.

Everything you need is already here:

* Your namespace is `{{< param session_namespace >}}`, and you have admin
  access to it.
* Once deployed, the application answers at
  `{{< param ingress_protocol >}}://frontend-{{< param session_hostname >}}`.
* The exercise files are in `~/exercises`, open in the terminals on the right.

You will:

1. Deploy the application with `kubectl`, from the instructions.
2. Change its configuration in the editor.
3. Watch it come up in the Kubernetes console.
4. Check your work before you move on.

```terminal:execute
command: kubectl get all
```

{{< note >}}
Click an action like the one above to run it. You do not need to type
anything in this workshop.
{{< /note >}}
