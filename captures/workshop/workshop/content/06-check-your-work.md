---
title: Check your work
---

Before you build on a step, check that it worked. Start a pod named `one`:

```terminal:execute
command: kubectl apply -f pods/one.yaml && kubectl get pods one
```

Then check it is running. The check runs a test from the workshop, with the
pod's name as its argument:

```examiner:execute-test
name: test-that-pod-exists
title: Verify that pod named "one" is running
args:
- one
timeout: 5
```

This is the test it runs. It exits with 0 when the pod is running, and the
check passes:

```editor:open-file
file: /opt/workshop/examiner/tests/test-that-pod-exists
```

```terminal:clear-all
hidden: true
autostart: true
```
