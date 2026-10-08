---
title: Just the tools
---

This workshop is about Python, so it needs no cluster. Its Session is a
container with the tools, and nothing more:

```terminal:execute
command: python3 --version && uv --version
clear: true
```

Create a script and run it:

```terminal:execute
command: |-
  uv init -q --script hello.py && uv run -q hello.py
```

There is no Kubernetes cluster to reach from here at all:

```terminal:execute
command: |-
  kubectl get pods 2>&1 | tail -1
session: 2
clear: true
```
