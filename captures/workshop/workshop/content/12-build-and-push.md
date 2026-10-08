---
title: Build, push and commit
---

Your Session has a Docker daemon, an image registry and a Git server of its
own. Build Bookshelf into an image and push it to your registry,
`{{< param registry_host >}}`:

```terminal:execute
command: |-
  docker build -q -t bookshelf:v1 frontend/ && skopeo copy docker-daemon:bookshelf:v1 docker://$REGISTRY_HOST/bookshelf:v1 && skopeo list-tags docker://$REGISTRY_HOST/bookshelf
clear: true
```

Then keep the source in your Git server, at
`{{< param git_protocol >}}://{{< param git_host >}}`:

```terminal:execute
command: |-
  (cd frontend && git init -q -b main && git add . && git commit -q -m "Add Bookshelf" && git push $GIT_PROTOCOL://$GIT_HOST/bookshelf.git main)
session: 2
clear: true
```

Both stay with your Session, and are deleted with it.
