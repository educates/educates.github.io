---
title: Wait for the pod
---

The check below started as this page opened. It tries again every second,
and passes once a pod named `two` is running:

```examiner:execute-test
name: test-that-pod-exists
title: Verify that pod named "two" is running
args:
- two
retries: .INF
delay: 1
autostart: true
```

Start the pod, and watch the check pass on its own:

```terminal:execute
command: |-
  kubectl apply -f pods/two.yaml && kubectl wait --for=condition=Ready pod/two --timeout=60s && kubectl get pods two
clear: true
```

```terminal:clear-all
hidden: true
autostart: true
```
