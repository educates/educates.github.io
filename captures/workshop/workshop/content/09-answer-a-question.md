---
title: Answer a question
---

How many replicas of the frontend are running now? Enter your answer, and the
check compares it with the deployment:

```examiner:execute-test
name: check-replicas
prefix: Question
title: Replicas of the frontend
inputs:
  schema:
    replicas:
      type: integer
      title: "Number of replicas:"
      required: true
  form:
  - "*"
  - type: submit
    title: Check my answer
```

Look it up if you are not sure:

```terminal:execute
command: kubectl get deployment frontend
```

```terminal:clear-all
hidden: true
autostart: true
```
