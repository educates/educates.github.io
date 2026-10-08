---
title: Checked from outside
---

This check does not run in your Session. A service of the training team
runs it, with read access to the cluster, out of reach of the terminals on
the right:

```examiner:execute-test
name: deployment-ready
title: Verify that the frontend is ready, checked by the training team
url: "{{< param ingress_protocol >}}://example-academy.{{< param ingress_domain >}}/check/deployment-ready"
args:
- "{{< param session_namespace >}}"
- frontend
timeout: 10
```

The check names the service by its URL:

```editor:open-file
file: /opt/workshop/content/10-checked-from-outside.md
line: 9
```

```editor:select-matching-text
file: /opt/workshop/content/10-checked-from-outside.md
text: "name: deployment-ready"
after: 7
```

It asks the cluster about your deployment, the same thing you can see from
here:

```terminal:execute
command: kubectl get deployment frontend
```

```terminal:clear-all
hidden: true
autostart: true
```
