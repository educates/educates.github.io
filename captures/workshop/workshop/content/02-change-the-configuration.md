---
title: Change the configuration
---

A new release of the web server is out. Open the deployment in the editor,
at the container definition:

```editor:open-file
file: ~/exercises/frontend/deployment.yaml
line: 22
```

Find the image it runs:

```editor:select-matching-text
file: ~/exercises/frontend/deployment.yaml
text: "nginx-unprivileged:(.*)"
isRegex: true
group: 1
```

Move it to the new release:

```editor:replace-matching-text
file: ~/exercises/frontend/deployment.yaml
match: "1.27-alpine"
replacement: "1.28-alpine"
```

Ask for a third replica:

```editor:set-yaml-value
file: ~/exercises/frontend/deployment.yaml
path: spec.replicas
value: 3
```

Add a label that names the team that owns it:

```editor:append-lines-after-match
file: ~/exercises/frontend/deployment.yaml
match: "    app: frontend"
text: "    team: bookshelf"
```

And record the change in a file of its own:

```editor:create-file
file: ~/exercises/frontend/CHANGES.md
text: |
  # Changes

  - Web server moved to 1.28, with three replicas.
```
