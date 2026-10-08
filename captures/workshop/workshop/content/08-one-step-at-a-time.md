---
title: One step at a time
---

Check the whole application in one click. Each check that passes starts the
next, and the last one asks the application for its page:

```examiner:execute-test
name: test-deployment-ready
title: Verify that every replica of the frontend is ready
args:
- frontend
timeout: 5
cascade: true
```

```examiner:execute-test
name: test-service-exists
title: Verify that the frontend service has endpoints
args:
- frontend
timeout: 5
cascade: true
```

```terminal:execute
command: curl -s frontend.$SESSION_NAMESPACE.svc:8080 | grep -o 'pod <code>.*</code>'
```

```terminal:clear-all
hidden: true
autostart: true
```
